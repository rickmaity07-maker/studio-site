package com.rickbuild.showcase

import com.rickbuild.showcase.data.Api
import com.rickbuild.showcase.data.FeedCache
import com.rickbuild.showcase.data.LeadRequest
import com.rickbuild.showcase.ui.AppViewModel
import com.rickbuild.showcase.ui.Screen
import com.rickbuild.showcase.ui.SendState
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.setMain
import kotlinx.coroutines.withTimeout
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class AppViewModelTest {
    private lateinit var server: MockWebServer

    @Before
    fun setUp() {
        Dispatchers.setMain(UnconfinedTestDispatcher())
        server = MockWebServer().apply { start() }
    }

    @After
    fun tearDown() {
        server.shutdown()
        Dispatchers.resetMain()
    }

    private fun loadedViewModel(): AppViewModel = runBlocking {
        server.enqueue(MockResponse().setBody(Fixtures.FEED))
        val vm = AppViewModel(Api(server.url("/").toString()))
        withTimeout(5_000) { vm.feed.first { !it.loading } }
        vm
    }

    @Test
    fun `loads the feed on start`() {
        val vm = loadedViewModel()
        val feed = vm.feed.value
        assertEquals(3, feed.projects.size)
        assertNull(feed.error)
        assertEquals(listOf("New website", "Online store"), feed.options.projectTypes)
    }

    @Test
    fun `a failed load keeps a readable error, and retry recovers`() = runBlocking {
        server.enqueue(MockResponse().setResponseCode(500).setBody("""{"error":"Database unavailable."}"""))
        val vm = AppViewModel(Api(server.url("/").toString()))
        val failed = withTimeout(5_000) { vm.feed.first { !it.loading && it.error != null } }
        assertEquals("Database unavailable.", failed.error)
        assertTrue(failed.projects.isEmpty())

        server.enqueue(MockResponse().setBody(Fixtures.FEED))
        vm.load(refresh = true)
        val ok = withTimeout(5_000) { vm.feed.first { !it.refreshing && it.projects.isNotEmpty() } }
        assertNull(ok.error)
    }

    @Test
    fun `navigation supports open, back, replace and tabs`() {
        val vm = loadedViewModel()
        assertEquals("the app opens on Home", listOf(Screen.Home), vm.stack.value)

        vm.showTab(Screen.Work)
        vm.open(Screen.Detail("bar-05"))
        vm.open(Screen.Demo("bar-05"))
        assertEquals(Screen.Demo("bar-05"), vm.stack.value.last())

        assertTrue(vm.back())
        assertEquals(Screen.Detail("bar-05"), vm.stack.value.last())

        // "Next project" swaps the top screen instead of stacking.
        vm.replace(Screen.Detail("rebo-salon"))
        assertEquals(listOf(Screen.Work, Screen.Detail("rebo-salon")), vm.stack.value)

        assertTrue(vm.back())
        assertFalse("can't go back past the root", vm.back())

        vm.showTab(Screen.Request())
        assertEquals(listOf(Screen.Request()), vm.stack.value)
    }

    @Test
    fun `next project wraps around the list`() {
        val vm = loadedViewModel()
        assertEquals("rebo-salon", vm.nextProject("bar-05")?.slug)
        assertEquals("bar-05", vm.nextProject("vespre")?.slug)
        assertNull(vm.nextProject("unknown"))
        assertEquals("Bar-05", vm.project("bar-05")?.name)
    }

    private val lead = LeadRequest(
        name = "Lena", email = "lena@example.test", phone = "", business = "Café",
        projectType = "New website", budget = "Not sure yet", timeline = "Within a month",
        message = "", projectRef = "", consent = true,
    )

    @Test
    fun `sending a request moves to Sent`() = runBlocking {
        val vm = loadedViewModel()
        server.enqueue(MockResponse().setResponseCode(201).setBody("""{"ok":true}"""))
        vm.sendLead(lead)
        assertEquals(SendState.Sent, withTimeout(5_000) { vm.send.first { it == SendState.Sent } })

        vm.resetSend()
        assertEquals(SendState.Idle, vm.send.value)
    }

    @Test
    fun `a rejected request shows the server's reason`() = runBlocking {
        val vm = loadedViewModel()
        server.enqueue(MockResponse().setResponseCode(429).setBody("""{"error":"Too many requests."}"""))
        vm.sendLead(lead)
        val failed = withTimeout(5_000) { vm.send.first { it is SendState.Failed } } as SendState.Failed
        assertEquals("Too many requests.", failed.message)
    }

    @Test
    fun `opening the request tab clears an old result`() = runBlocking {
        val vm = loadedViewModel()
        server.enqueue(MockResponse().setResponseCode(201).setBody("""{"ok":true}"""))
        vm.sendLead(lead)
        withTimeout(5_000) { vm.send.first { it == SendState.Sent } }
        vm.showTab(Screen.Request())
        assertEquals(SendState.Idle, vm.send.value)
    }

    @Test
    fun `links from the website open the right screen`() {
        val vm = loadedViewModel()
        vm.openLink("/work/bar-05")
        assertEquals(listOf(Screen.Work, Screen.Detail("bar-05")), vm.stack.value)
        vm.openLink("/work")
        assertEquals(listOf(Screen.Work), vm.stack.value)
        vm.openLink("/request")
        assertEquals(listOf(Screen.Request()), vm.stack.value)
        // Anything else leaves the app where it is.
        vm.openLink("/privacy")
        assertEquals(listOf(Screen.Request()), vm.stack.value)
    }

    @Test
    fun `saved projects show instantly, and stay when the site is unreachable`() = runBlocking {
        val api = Api(server.url("/").toString())
        val cache = FeedCache(kotlin.io.path.createTempFile("feed", ".json").toFile().also { it.delete() }) { api }
        cache.write(api.decodeFeed(Fixtures.FEED))

        server.enqueue(MockResponse().setResponseCode(503).setBody("""{"error":"Down for maintenance."}"""))
        val vm = AppViewModel(api, cache)
        val state = withTimeout(5_000) { vm.feed.first { !it.loading && !it.refreshing } }
        assertEquals(3, state.projects.size)
        assertTrue("marked as offline", state.offline)
        assertEquals("Down for maintenance.", state.error)
    }

    @Test
    fun `a successful load is saved for next time`() = runBlocking {
        val api = Api(server.url("/").toString())
        val file = kotlin.io.path.createTempFile("feed", ".json").toFile().also { it.delete() }
        val cache = FeedCache(file) { api }
        server.enqueue(MockResponse().setBody(Fixtures.FEED))
        val vm = AppViewModel(api, cache)
        withTimeout(5_000) { vm.feed.first { it.projects.isNotEmpty() && !it.refreshing } }
        withTimeout(5_000) { while (!file.exists()) kotlinx.coroutines.delay(20) }
        assertEquals(3, cache.read()?.projects?.size)
    }
}
