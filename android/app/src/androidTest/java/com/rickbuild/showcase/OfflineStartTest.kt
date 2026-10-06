package com.rickbuild.showcase

import androidx.compose.ui.test.ExperimentalTestApi
import androidx.compose.ui.test.hasText
import androidx.compose.ui.test.junit4.createEmptyComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.test.core.app.ActivityScenario
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.BeforeClass
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

/* The site is down when the app starts: a readable message, then a working retry. */
@OptIn(ExperimentalTestApi::class)
@RunWith(AndroidJUnit4::class)
class OfflineStartTest {
    companion object {
        @JvmStatic
        @BeforeClass
        fun startFakeSite() = FakeSite.start()
    }

    @get:Rule
    val rule = createEmptyComposeRule()

    @Test
    fun failedFirstLoadShowsTheErrorAndRetryRecovers() {
        FakeSite.reset()
        FakeSite.failNextFeeds = 1
        ActivityScenario.launch(MainActivity::class.java).use {
            rule.waitUntilExactlyOneExists(hasText("The backend isn't configured yet."), 10_000)
            rule.onNodeWithText("TRY AGAIN").performClick()
            rule.waitUntilExactlyOneExists(hasText("Bar-05"), 10_000)
        }
    }
}
