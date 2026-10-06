package com.rickbuild.showcase.updates

import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.PackageInstaller
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.core.content.FileProvider
import com.rickbuild.showcase.BuildConfig
import com.rickbuild.showcase.data.Api
import com.rickbuild.showcase.data.ApiException
import com.rickbuild.showcase.data.Release
import com.rickbuild.showcase.data.Services
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.File
import java.io.IOException
import java.security.MessageDigest
import java.util.concurrent.TimeUnit

sealed interface UpdateState {
    data object Idle : UpdateState
    data class Available(val release: Release, val mandatory: Boolean) : UpdateState
    data class Downloading(val release: Release, val progress: Float) : UpdateState
    data class Installing(val release: Release) : UpdateState
    data class NeedsPermission(val release: Release) : UpdateState
    data class Failed(val release: Release, val reason: String) : UpdateState
}

/*
  Updates without the Play Store, like the Paulaner app. The website lists
  published versions (/api/app/version); a newer one is downloaded, its SHA-256
  checked against the published value, and Android installs it over the running
  app. Android itself refuses anything not signed with the same release key, so
  a tampered file can't get in even if a download were hijacked.

  MIUI (Redmi, Xiaomi) can refuse installs started through PackageInstaller
  sessions; if that happens the verified file is handed to Android's standard
  install screen instead, which MIUI always allows once "install unknown apps"
  is on for this app.
*/
class Updater(private val context: Context, private val api: () -> Api) {
    private val _state = MutableStateFlow<UpdateState>(UpdateState.Idle)
    val state: StateFlow<UpdateState> = _state
    private val http = OkHttpClient.Builder().connectTimeout(15, TimeUnit.SECONDS).readTimeout(60, TimeUnit.SECONDS).build()
    private val dir get() = File(context.cacheDir, "updates").apply { mkdirs() }
    private var lastApk: File? = null

    val currentVersionCode get() = BuildConfig.VERSION_CODE
    val currentVersionName: String get() = BuildConfig.VERSION_NAME

    /* Asks the website whether there's something newer. Quietly does nothing when offline. */
    suspend fun check(): UpdateState {
        if (_state.value is UpdateState.Downloading || _state.value is UpdateState.Installing) return _state.value
        val info = try {
            api().updateInfo(currentVersionCode)
        } catch (e: ApiException) {
            return _state.value
        }
        val latest = info.latest
        _state.value = if (latest == null) UpdateState.Idle else UpdateState.Available(latest, info.mustUpdate)
        return _state.value
    }

    fun dismiss() {
        val s = _state.value
        if (s is UpdateState.Available && !s.mandatory) _state.value = UpdateState.Idle
        if (s is UpdateState.Failed) _state.value = UpdateState.Available(s.release, false)
    }

    fun canInstall() = Build.VERSION.SDK_INT < Build.VERSION_CODES.O || context.packageManager.canRequestPackageInstalls()

    /* The one-time "install unknown apps" screen for this app. */
    fun permissionIntent() =
        Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:${context.packageName}")).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)

    suspend fun downloadAndInstall(release: Release) {
        if (!canInstall()) {
            _state.value = UpdateState.NeedsPermission(release)
            return
        }
        try {
            val apk = download(release)
            lastApk = apk
            _state.value = UpdateState.Installing(release)
            withContext(Dispatchers.IO) { installWithSession(apk) }
        } catch (e: UpdateException) {
            _state.value = UpdateState.Failed(release, e.reason)
        } catch (e: IOException) {
            _state.value = UpdateState.Failed(release, "offline")
        } catch (e: SecurityException) {
            // Some skins refuse sessions outright; the standard install screen still works.
            lastApk?.let { installWithSystemScreen(it) } ?: run { _state.value = UpdateState.Failed(release, "install") }
        }
    }

    private suspend fun download(release: Release): File = withContext(Dispatchers.IO) {
        val target = File(dir, "rick-build-${release.versionCode}.apk")
        // A complete, verified file from an earlier attempt can be reused.
        if (target.exists() && target.length() == release.sizeBytes && sha256(target) == release.sha256.lowercase()) return@withContext target
        dir.listFiles()?.forEach { it.delete() }
        val partial = File(dir, "rick-build-${release.versionCode}.part")
        _state.value = UpdateState.Downloading(release, 0f)
        http.newCall(Request.Builder().url(release.url).build()).execute().use { response ->
            if (!response.isSuccessful) throw UpdateException("download_${response.code}")
            val body = response.body ?: throw UpdateException("download_empty")
            val total = body.contentLength().takeIf { it > 0 } ?: release.sizeBytes
            body.byteStream().use { input ->
                partial.outputStream().use { output ->
                    val buffer = ByteArray(64 * 1024)
                    var done = 0L
                    var lastReported = 0f
                    while (true) {
                        val n = input.read(buffer)
                        if (n < 0) break
                        output.write(buffer, 0, n)
                        done += n
                        val progress = (done.toFloat() / total).coerceIn(0f, 1f)
                        if (progress - lastReported > 0.01f) {
                            lastReported = progress
                            _state.value = UpdateState.Downloading(release, progress)
                        }
                    }
                }
            }
        }
        if (sha256(partial) != release.sha256.lowercase()) {
            partial.delete()
            throw UpdateException("checksum")
        }
        partial.renameTo(target)
        target
    }

    private fun installWithSession(apk: File) {
        val installer = context.packageManager.packageInstaller
        val params = PackageInstaller.SessionParams(PackageInstaller.SessionParams.MODE_FULL_INSTALL).apply {
            setAppPackageName(context.packageName)
            // Android 12+: once this app installed itself, later updates may skip the confirmation tap.
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) setRequireUserAction(PackageInstaller.SessionParams.USER_ACTION_NOT_REQUIRED)
        }
        val sessionId = installer.createSession(params)
        installer.openSession(sessionId).use { session ->
            session.openWrite("rick-build.apk", 0, apk.length()).use { out ->
                apk.inputStream().use { it.copyTo(out) }
                session.fsync(out)
            }
            val intent = Intent(context, InstallReceiver::class.java).setPackage(context.packageName)
            val flags = PendingIntent.FLAG_UPDATE_CURRENT or (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) PendingIntent.FLAG_MUTABLE else 0)
            val pending = PendingIntent.getBroadcast(context, sessionId, intent, flags)
            session.commit(pending.intentSender)
        }
    }

    /* Android's own install screen for a verified file (the MIUI-safe route). */
    private fun installWithSystemScreen(apk: File) {
        val uri = FileProvider.getUriForFile(context, "${context.packageName}.updates", apk)
        @Suppress("DEPRECATION")
        val intent = Intent(Intent.ACTION_INSTALL_PACKAGE)
            .setData(uri)
            .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(intent)
    }

    internal fun onInstallResult(status: Int, message: String?) {
        val release = when (val s = _state.value) {
            is UpdateState.Installing -> s.release
            is UpdateState.Downloading -> s.release
            else -> return
        }
        when (status) {
            // On success Android restarts the app in the new version.
            PackageInstaller.STATUS_SUCCESS, PackageInstaller.STATUS_PENDING_USER_ACTION -> Unit
            PackageInstaller.STATUS_FAILURE_ABORTED -> _state.value = UpdateState.Failed(release, "aborted")
            // MIUI's "USER_RESTRICTED" and similar: fall back to the standard install screen.
            else -> lastApk?.let(::installWithSystemScreen) ?: run { _state.value = UpdateState.Failed(release, message ?: "install") }
        }
    }

    private class UpdateException(val reason: String) : Exception(reason)

    companion object {
        fun sha256(file: File): String {
            val digest = MessageDigest.getInstance("SHA-256")
            file.inputStream().use { input ->
                val buffer = ByteArray(64 * 1024)
                while (true) {
                    val n = input.read(buffer)
                    if (n < 0) break
                    digest.update(buffer, 0, n)
                }
            }
            return digest.digest().joinToString("") { "%02x".format(it) }
        }
    }
}

/* Receives the installer's answer: asks the user to confirm when Android wants it, reports failures back. */
class InstallReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val status = intent.getIntExtra(PackageInstaller.EXTRA_STATUS, PackageInstaller.STATUS_FAILURE)
        if (status == PackageInstaller.STATUS_PENDING_USER_ACTION) {
            @Suppress("DEPRECATION")
            val confirm = if (Build.VERSION.SDK_INT >= 33) intent.getParcelableExtra(Intent.EXTRA_INTENT, Intent::class.java) else intent.getParcelableExtra(Intent.EXTRA_INTENT)
            confirm?.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)?.let(context::startActivity)
        }
        Services.updater?.onInstallResult(status, intent.getStringExtra(PackageInstaller.EXTRA_STATUS_MESSAGE))
    }
}
