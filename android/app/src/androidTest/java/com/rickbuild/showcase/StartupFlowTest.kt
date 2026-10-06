package com.rickbuild.showcase

import android.content.Intent
import android.net.Uri
import androidx.compose.ui.test.ExperimentalTestApi
import androidx.compose.ui.test.hasContentDescription
import androidx.compose.ui.test.hasScrollToNodeAction
import androidx.compose.ui.test.onFirst
import androidx.compose.ui.test.performScrollToNode
import androidx.compose.ui.test.hasTestTag
import androidx.compose.ui.test.hasText
import androidx.compose.ui.test.junit4.createEmptyComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performScrollTo
import androidx.test.core.app.ActivityScenario
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import org.junit.Before
import org.junit.BeforeClass
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@OptIn(ExperimentalTestApi::class)
@RunWith(AndroidJUnit4::class)
class StartupFlowTest {
    companion object {
        @JvmStatic
        @BeforeClass
        fun startFakeSite() = FakeSite.start()
    }

    @get:Rule
    val rule = createEmptyComposeRule()

    @Before
    fun reset() = FakeSite.reset()

    @Test
    fun homeMirrorsTheWebsite() {
        ActivityScenario.launch(MainActivity::class.java).use {
            rule.waitUntilAtLeastOneExists(hasText("Websites you can actually click through.", substring = true), 10_000)
            rule.waitUntilAtLeastOneExists(hasText("builds you can open right now.", substring = true), 10_000)
            // The page is a lazy list: scroll it (the outer scroller, not the carousel) to each section.
            val page = rule.onAllNodes(hasScrollToNodeAction()).onFirst()
            page.performScrollToNode(hasText("Tisch reservieren", substring = true, ignoreCase = true))
            rule.onNodeWithText("EN").performClick()
            rule.waitUntilAtLeastOneExists(hasText("Book a table", substring = true, ignoreCase = true), 5_000)
            page.performScrollToNode(hasText("Four stages, no surprises."))
            page.performScrollToNode(hasText("Have a business that needs a site?"))
        }
    }

    @Test
    fun aNewerVersionIsOfferedAndCanBePostponed() {
        FakeSite.latestRelease =
            """{"versionCode":999,"versionName":"9.9.9","url":"/api/app/download/999","sha256":"00","sizeBytes":1,"notes":"Test release","mandatory":false}"""
        ActivityScenario.launch(MainActivity::class.java).use {
            rule.waitUntilExactlyOneExists(hasText("Version 9.9.9 is ready"), 10_000)
            rule.onNodeWithText("Test release").assertExists()
            rule.onNodeWithText("LATER").performClick()
            rule.waitUntilDoesNotExist(hasTestTag("update-card"), 5_000)
        }
    }

    @Test
    fun aProjectLinkFromTheWebsiteOpensThatProject() {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://rickbuild.vercel.app/work/bar-05")).setClass(context, MainActivity::class.java)
        ActivityScenario.launch<MainActivity>(intent).use {
            rule.waitUntilExactlyOneExists(hasText("A late-night bar site."), 10_000)
        }
    }

    @Test
    fun projectPageSwitchesBetweenDesktopAndPhone() {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://rickbuild.vercel.app/work/bar-05")).setClass(context, MainActivity::class.java)
        ActivityScenario.launch<MainActivity>(intent).use {
            rule.waitUntilExactlyOneExists(hasText("A late-night bar site."), 10_000)
            rule.onNodeWithText("PHONE").performScrollTo().performClick()
            rule.waitUntilExactlyOneExists(hasContentDescription("Bar-05 on a phone"), 5_000)
            rule.onNodeWithText("DESKTOP").performClick()
            rule.waitUntilDoesNotExist(hasContentDescription("Bar-05 on a phone"), 5_000)
        }
    }
}
