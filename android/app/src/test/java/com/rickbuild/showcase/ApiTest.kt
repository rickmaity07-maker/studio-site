package com.rickbuild.showcase

import com.rickbuild.showcase.data.Api
import com.rickbuild.showcase.data.ApiException
import com.rickbuild.showcase.data.LeadRequest
import kotlinx.coroutines.runBlocking
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Assert.fail
import org.junit.Before
import org.junit.Test

class ApiTest {
    private lateinit var server: MockWebServer
    private lateinit var api: Api

    @Before
    fun setUp() {
        server = MockWebServer().apply { start() }
        api = Api(server.url("/").toString())
    }

    @After
    fun tearDown() = server.shutdown()

    @Test
    fun `feed parses projects and form options, ignoring unknown fields`() = runBlocking {
        server.enqueue(MockResponse().setBody(Fixtures.FEED))
        val feed = api.feed()

        val request = server.takeRequest()
        assertEquals("/api/projects", request.path)
        assertEquals("application/json", request.getHeader("Accept"))

        assertEquals(3, feed.projects.size)
        val bar = feed.projects[0]
        assertEquals("bar-05", bar.slug)
        assertEquals(listOf("Next.js", "Neon Postgres"), bar.stack)
        assertFalse(bar.embeddable)
        assertEquals("/api/images/abc", bar.image?.url)
        // Missing optional fields fall back to defaults.
        val vespre = feed.projects[2]
        assertNull(vespre.liveUrl)
        assertTrue(vespre.embeddable)
        assertNull(vespre.image)
        assertEquals(listOf("Under €1,000", "€1,000 - €3,000"), feed.leadOptions.budgets)
    }

    @Test
    fun `sendLead posts the request as JSON tagged as coming from the app`() = runBlocking {
        server.enqueue(MockResponse().setResponseCode(201).setBody("""{"ok":true}"""))
        api.sendLead(
            LeadRequest(
                name = "Lena", email = "lena@example.test", phone = "", business = "Café",
                projectType = "New website", budget = "Not sure yet", timeline = "Within a month",
                message = "Hi", projectRef = "Bar-05", consent = true,
            ),
        )
        val request = server.takeRequest()
        assertEquals("POST", request.method)
        assertEquals("/api/leads", request.path)
        assertTrue(request.getHeader("Content-Type")!!.startsWith("application/json"))
        val body = request.body.readUtf8()
        assertTrue(body, body.contains(""""source":"android""""))
        assertTrue(body, body.contains(""""projectRef":"Bar-05""""))
        assertTrue(body, body.contains(""""consent":true"""))
    }

    @Test
    fun `server errors surface the site's own message`() = runBlocking {
        server.enqueue(MockResponse().setResponseCode(429).setBody("""{"error":"Too many requests from your connection."}"""))
        try {
            api.feed()
            fail("expected ApiException")
        } catch (e: ApiException) {
            assertEquals("Too many requests from your connection.", e.message)
        }
    }

    @Test
    fun `errors without a JSON body still give a readable message`() = runBlocking {
        server.enqueue(MockResponse().setResponseCode(502).setBody("<html>Bad gateway</html>"))
        try {
            api.feed()
            fail("expected ApiException")
        } catch (e: ApiException) {
            assertEquals("Something went wrong (502). Please try again.", e.message)
        }
    }

    @Test
    fun `an unreachable server is reported as offline, not a crash`() = runBlocking {
        server.shutdown()
        try {
            api.feed()
            fail("expected ApiException")
        } catch (e: ApiException) {
            assertEquals("Couldn't reach the server. Check your connection and try again.", e.message)
        }
    }

    @Test
    fun `absolute resolves site-relative paths and keeps full URLs`() {
        val base = server.url("/").toString().trimEnd('/')
        assertEquals("$base/api/images/abc", api.absolute("/api/images/abc"))
        assertEquals("https://cdn.example/x.png", api.absolute("https://cdn.example/x.png"))
    }
}
