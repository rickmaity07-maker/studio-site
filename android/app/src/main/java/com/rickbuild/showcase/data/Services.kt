package com.rickbuild.showcase.data

import com.rickbuild.showcase.BuildConfig

/*
  The one place the app's dependencies are created. Instrumented tests swap
  `api` for one pointing at a local fake server before the app starts.
*/
object Services {
    @Volatile
    var api: Api = Api(BuildConfig.SITE_URL)
}
