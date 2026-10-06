package com.rickbuild.showcase.data

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException
import java.util.concurrent.TimeUnit

/* A refusal from the server (its own human-readable message), or a dead connection. */
class ApiException(message: String) : Exception(message)

/*
  The website's public API: the project feed and the request form.
  Every call is a suspend function on the IO dispatcher.
*/
class Api(baseUrl: String) {
    private val base = baseUrl.trimEnd('/')
    private val http = OkHttpClient.Builder()
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(20, TimeUnit.SECONDS)
        .callTimeout(30, TimeUnit.SECONDS)
        .build()

    // encodeDefaults: LeadRequest.source defaults to "android" and must still be sent,
    // or the website files app requests as coming from the website.
    private val json = Json { ignoreUnknownKeys = true; explicitNulls = false; coerceInputValues = true; encodeDefaults = true }
    private val jsonType = "application/json; charset=utf-8".toMediaType()

    /* Site-relative paths ("/api/images/…", "/privacy") become absolute URLs. */
    fun absolute(url: String) = if (url.startsWith("http")) url else base + url

    suspend fun feed(): Feed = json.decodeFromString(call(Request.Builder().url("$base/api/projects").get()))

    suspend fun sendLead(lead: LeadRequest) {
        val body = json.encodeToString(LeadRequest.serializer(), lead).toRequestBody(jsonType)
        call(Request.Builder().url("$base/api/leads").post(body))
    }

    private suspend fun call(builder: Request.Builder): String = withContext(Dispatchers.IO) {
        val response = try {
            http.newCall(builder.header("Accept", "application/json").build()).execute()
        } catch (e: IOException) {
            throw ApiException("Couldn't reach the server. Check your connection and try again.")
        }
        response.use {
            val text = it.body?.string().orEmpty()
            if (!it.isSuccessful) {
                val message = runCatching {
                    json.parseToJsonElement(text).jsonObject["error"]?.jsonPrimitive?.contentOrNull
                }.getOrNull()
                throw ApiException(message ?: "Something went wrong (${it.code}). Please try again.")
            }
            text
        }
    }
}
