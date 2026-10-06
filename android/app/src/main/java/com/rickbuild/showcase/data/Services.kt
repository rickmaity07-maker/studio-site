package com.rickbuild.showcase.data

import android.content.Context
import com.rickbuild.showcase.BuildConfig
import com.rickbuild.showcase.updates.Updater
import java.io.File

/*
  The one place the app's dependencies are created (set up in RickApp).
  Instrumented tests swap `api` for one pointing at a local fake site
  before the first screen opens.
*/
object Services {
    @Volatile
    var api: Api = Api(BuildConfig.SITE_URL)

    /* Null until RickApp starts (and in plain JVM unit tests). */
    var cache: FeedCache? = null
        private set
    var updater: Updater? = null
        private set

    fun init(context: Context) {
        if (cache != null) return
        cache = FeedCache(File(context.filesDir, "feed.json")) { api }
        updater = Updater(context.applicationContext) { api }
    }
}
