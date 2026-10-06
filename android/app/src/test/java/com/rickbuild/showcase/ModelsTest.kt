package com.rickbuild.showcase

import com.rickbuild.showcase.data.LeadOptions
import com.rickbuild.showcase.data.Project
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class ModelsTest {
    private fun project(liveUrl: String?) = Project(
        slug = "vespre", name = "Vespre", tagline = "", category = "E-commerce", year = "2026",
        description = "", liveUrl = liveUrl, accent = "#000000",
    )

    @Test
    fun `displayUrl strips the scheme and trailing slash`() {
        assertEquals("rebo-salon.vercel.app", project("https://rebo-salon.vercel.app/").displayUrl)
        assertEquals("example.com/path", project("http://example.com/path").displayUrl)
    }

    @Test
    fun `projects without a live URL show a placeholder address and are not live`() {
        assertEquals("vespre.build", project(null).displayUrl)
        assertFalse(project(null).isLive)
        assertFalse(project("   ").isLive)
        assertTrue(project("https://x.example").isLive)
    }

    @Test
    fun `fallback form options match the website and use plain hyphens`() {
        val d = LeadOptions.Default
        assertEquals(5, d.projectTypes.size)
        assertEquals(listOf("Under €1,000", "€1,000 - €3,000", "€3,000 - €7,000", "Not sure yet"), d.budgets)
        assertEquals(4, d.timelines.size)
        (d.projectTypes + d.budgets + d.timelines).forEach { assertFalse(it, it.contains('–') || it.contains('—')) }
    }
}
