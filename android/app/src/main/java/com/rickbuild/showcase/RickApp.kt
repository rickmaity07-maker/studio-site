package com.rickbuild.showcase

import android.app.Application
import com.rickbuild.showcase.data.Services

class RickApp : Application() {
    override fun onCreate() {
        super.onCreate()
        Services.init(this)
    }
}
