package com.rickbuild.showcase

import androidx.compose.ui.test.ExperimentalTestApi
import androidx.compose.ui.test.assert
import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.assertIsEnabled
import androidx.compose.ui.test.assertIsNotEnabled
import androidx.compose.ui.test.hasScrollToNodeAction
import androidx.compose.ui.test.hasText
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performScrollTo
import androidx.compose.ui.test.performScrollToNode
import androidx.compose.ui.test.performTextInput
import androidx.test.ext.junit.runners.AndroidJUnit4
import okhttp3.mockwebserver.MockResponse
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.BeforeClass
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

/* Real UI, real navigation, real HTTP: only the website is a local fake. */
@OptIn(ExperimentalTestApi::class)
@RunWith(AndroidJUnit4::class)
class AppFlowTest {
    companion object {
        @JvmStatic
        @BeforeClass
        fun startFakeSite() = FakeSite.start()
    }

    @get:Rule
    val rule = createAndroidComposeRule<MainActivity>()

    @Before
    fun reset() = FakeSite.reset()

    /* The app opens on Home; most tests start from the Work tab. */
    private fun waitForList() {
        rule.waitUntilAtLeastOneExists(hasText("WORK"), 10_000)
        rule.onNodeWithText("WORK").performClick()
        rule.waitUntilExactlyOneExists(hasText("Bar-05"), 10_000)
    }

    private fun back() = rule.runOnUiThread { rule.activity.onBackPressedDispatcher.onBackPressed() }

    @Test
    fun workListShowsProjectsAndFiltersByIndustry() {
        waitForList()
        rule.onNodeWithText("Every build, live and clickable").assertIsDisplayed()
        rule.onNodeWithText("Rebo Salon").assertExists()

        rule.onNodeWithText("BEAUTY & BOOKING").performClick()
        rule.waitUntilDoesNotExist(hasText("Bar-05"), 5_000)
        rule.onNodeWithText("Rebo Salon").assertIsDisplayed()

        rule.onNodeWithText("ALL").performClick()
        rule.waitUntilExactlyOneExists(hasText("Bar-05"), 5_000)
    }

    @Test
    fun projectPageShowsDetailsAndBackReturnsToTheList() {
        waitForList()
        rule.onNodeWithText("Bar-05").performClick()
        rule.waitUntilExactlyOneExists(hasText("A late-night bar site."), 5_000)
        rule.onNodeWithText("NEON POSTGRES").assertExists()
        rule.onNodeWithText("OPEN LIVE DEMO").assertExists()

        back()
        rule.waitUntilExactlyOneExists(hasText("Every build, live and clickable"), 5_000)
    }

    @Test
    fun projectNotYetLiveHasNoDemoButton() {
        waitForList()
        // A lazy list only creates cards near the screen: scroll the list to it.
        rule.onNode(hasScrollToNodeAction()).performScrollToNode(hasText("Vespre"))
        rule.onNodeWithText("Vespre").performClick()
        rule.waitUntilExactlyOneExists(hasText("Not hosted yet."), 5_000)
        rule.onNodeWithText("IN BUILD").assertExists()
        rule.onNodeWithText("OPEN LIVE DEMO").assertDoesNotExist()
    }

    @Test
    fun liveDemoOpensFullScreenAndCloses() {
        waitForList()
        rule.onNodeWithText("Bar-05").performClick()
        rule.onNodeWithText("OPEN LIVE DEMO").performScrollTo().performClick()
        // The browser chrome shows the site's address; the tab bar is gone.
        rule.waitUntilExactlyOneExists(hasText("the-bar-project.vercel.app"), 5_000)
        rule.onNodeWithText("WORK").assertDoesNotExist()
        rule.onNodeWithText("✕").performClick()
        rule.waitUntilExactlyOneExists(hasText("A late-night bar site."), 5_000)
    }

    @Test
    fun nextProjectMovesThroughTheList() {
        waitForList()
        rule.onNodeWithText("Bar-05").performClick()
        rule.onNodeWithText("Rebo Salon →").performScrollTo().performClick()
        rule.waitUntilExactlyOneExists(hasText("A booking platform."), 5_000)
    }

    @Test
    fun requestThisStyleCarriesTheReference() {
        waitForList()
        rule.onNodeWithText("Bar-05").performClick()
        rule.onNodeWithText("REQUEST THIS STYLE").performScrollTo().performClick()
        rule.waitUntilExactlyOneExists(hasText("Referencing: Bar-05"), 5_000)
    }

    @Test
    fun requestFormValidatesSendsAndConfirms() {
        waitForList()
        rule.onNodeWithText("START").performClick()
        rule.waitUntilExactlyOneExists(hasText("Tell me about your business"), 5_000)

        val send = rule.onNodeWithText("SEND REQUEST")
        send.performScrollTo().assertIsNotEnabled()

        rule.onNodeWithTag("field:Your name").performScrollTo().performTextInput("Lena Hoffmann")
        rule.onNodeWithTag("field:Email").performScrollTo().performTextInput("lena@cafe-hoffmann.test")
        rule.onNodeWithTag("field:Business name").performScrollTo().performTextInput("Café Hoffmann")
        pick("Project type", "Online store")
        pick("Budget", "€1,000 - €3,000")
        pick("Timeline", "It's urgent")
        rule.onNodeWithTag("field:Anything else? (optional)").performScrollTo().performTextInput("Bookings, please.")

        // Everything filled except consent: still not sendable.
        send.performScrollTo().assertIsNotEnabled()
        rule.onNodeWithTag("consent").performScrollTo().performClick()
        send.performScrollTo().assertIsEnabled().performClick()

        rule.waitUntilExactlyOneExists(hasText("Got it, thank you."), 10_000)
        assertEquals(1, FakeSite.leads.size)
        val body = FakeSite.leads.single()
        listOf(
            """"name":"Lena Hoffmann"""",
            """"email":"lena@cafe-hoffmann.test"""",
            """"projectType":"Online store"""",
            """"budget":"€1,000 - €3,000"""",
            """"timeline":"It's urgent"""",
            """"consent":true""",
            """"source":"android"""",
        ).forEach { assertTrue("missing $it in $body", body.contains(it)) }
    }

    @Test
    fun anInvalidEmailCannotBeSent() {
        waitForList()
        rule.onNodeWithText("START").performClick()
        rule.onNodeWithTag("field:Your name").performScrollTo().performTextInput("Lena")
        rule.onNodeWithTag("field:Email").performScrollTo().performTextInput("not-an-email")
        rule.onNodeWithTag("field:Business name").performScrollTo().performTextInput("Café")
        pick("Project type", "New website")
        pick("Budget", "Under €1,000")
        pick("Timeline", "Within a month")
        rule.onNodeWithTag("consent").performScrollTo().performClick()
        rule.onNodeWithText("SEND REQUEST").performScrollTo().assertIsNotEnabled()
    }

    @Test
    fun aServerRejectionIsShownAndNothingIsLost() {
        FakeSite.leadResponse = MockResponse().setResponseCode(429)
            .setBody("""{"error":"Too many requests from your connection. Please try again later or email directly."}""")
        waitForList()
        rule.onNodeWithText("START").performClick()
        rule.onNodeWithTag("field:Your name").performScrollTo().performTextInput("Lena")
        rule.onNodeWithTag("field:Email").performScrollTo().performTextInput("lena@example.test")
        rule.onNodeWithTag("field:Business name").performScrollTo().performTextInput("Café")
        pick("Project type", "New website")
        pick("Budget", "Under €1,000")
        pick("Timeline", "Within a month")
        rule.onNodeWithTag("consent").performScrollTo().performClick()
        rule.onNodeWithText("SEND REQUEST").performScrollTo().performClick()

        rule.waitUntilExactlyOneExists(hasText("Too many requests", substring = true), 10_000)
        // The form keeps what was typed, so the visitor can try again.
        rule.onNodeWithTag("field:Your name").assert(hasText("Lena"))
    }

    private fun pick(label: String, option: String) {
        rule.onNodeWithTag("select:$label").performScrollTo().performClick()
        rule.waitUntilExactlyOneExists(hasText(option), 5_000)
        rule.onNodeWithText(option).performClick()
        rule.waitUntilExactlyOneExists(hasText(option), 5_000)
    }
}
