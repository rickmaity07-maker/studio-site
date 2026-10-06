package com.rickbuild.showcase

import com.rickbuild.showcase.data.Api
import com.rickbuild.showcase.data.Services
import okhttp3.mockwebserver.Dispatcher
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import okhttp3.mockwebserver.RecordedRequest
import java.net.InetAddress
import java.util.concurrent.CopyOnWriteArrayList

/*
  A stand-in for the website on the device itself: serves a fixed project
  feed and records project requests, so UI tests are fast and repeatable.
*/
object FakeSite {
    private var server: MockWebServer? = null
    val leads = CopyOnWriteArrayList<String>()

    /** How many upcoming feed requests should fail (to test the retry path). */
    @Volatile var failNextFeeds = 0

    /** Response for the next project request. */
    @Volatile var leadResponse: MockResponse = MockResponse().setResponseCode(201).setBody("""{"ok":true}""")

    fun start() {
        if (server != null) return
        val s = MockWebServer()
        s.dispatcher = object : Dispatcher() {
            override fun dispatch(request: RecordedRequest): MockResponse = when {
                request.path == "/api/projects" && failNextFeeds > 0 -> {
                    failNextFeeds--
                    MockResponse().setResponseCode(503).setBody("""{"error":"The backend isn't configured yet."}""")
                }
                request.path == "/api/projects" -> MockResponse().setBody(FEED)
                request.path == "/api/leads" && request.method == "POST" -> {
                    leads += request.body.readUtf8()
                    leadResponse
                }
                else -> MockResponse().setResponseCode(404)
            }
        }
        s.start(InetAddress.getByName("localhost"), 0)
        server = s
        Services.api = Api(s.url("/").toString())
    }

    fun reset() {
        leads.clear()
        failNextFeeds = 0
        leadResponse = MockResponse().setResponseCode(201).setBody("""{"ok":true}""")
    }

    private const val FEED = """
    {
      "projects": [
        {"slug":"bar-05","name":"Bar-05","tagline":"Cocktail bar","category":"Hospitality","year":"2026",
         "stack":["Next.js","Neon Postgres"],"description":"A late-night bar site.",
         "liveUrl":"https://the-bar-project.vercel.app","embeddable":false,"accent":"#FF6B35","featured":true},
        {"slug":"rebo-salon","name":"Rebo Salon","tagline":"Barbershop booking","category":"Beauty & Booking","year":"2025",
         "stack":["Next.js"],"description":"A booking platform.","liveUrl":"https://rebo-salon.vercel.app","accent":"#E0B12E"},
        {"slug":"vespre","name":"Vespre","tagline":"Perfume store","category":"E-commerce","year":"2026",
         "stack":[],"description":"Not hosted yet.","accent":"#7A6A53"}
      ],
      "leadOptions": {
        "projectTypes":["New website","Online store"],
        "budgets":["Under €1,000","€1,000 - €3,000"],
        "timelines":["Within a month","It's urgent"]
      }
    }
    """
}
