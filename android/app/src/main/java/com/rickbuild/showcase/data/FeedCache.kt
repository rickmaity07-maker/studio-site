package com.rickbuild.showcase.data

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File

/*
  The last project feed, kept on the device. The app shows it instantly on
  start (also offline), then refreshes from the website in the background.
*/
class FeedCache(private val file: File, private val api: () -> Api) {
    suspend fun read(): Feed? = withContext(Dispatchers.IO) {
        runCatching { if (file.exists()) api().decodeFeed(file.readText()) else null }.getOrNull()
    }

    suspend fun write(feed: Feed) = withContext(Dispatchers.IO) {
        runCatching {
            val tmp = File(file.parentFile, file.name + ".tmp")
            tmp.writeText(api().encodeFeed(feed))
            tmp.renameTo(file)
        }
        Unit
    }
}
