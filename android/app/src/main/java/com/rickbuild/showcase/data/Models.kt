package com.rickbuild.showcase.data

import kotlinx.serialization.Serializable

/* Mirrors data/projects.ts on the website. Image URLs may be site-relative ("/api/images/…"). */
@Serializable
data class ProjectImage(val url: String, val id: String? = null)

@Serializable
data class Project(
    val slug: String,
    val name: String,
    val tagline: String,
    val category: String,
    val year: String,
    val stack: List<String> = emptyList(),
    val description: String,
    val liveUrl: String? = null,
    val embeddable: Boolean = true,
    val accent: String,
    val featured: Boolean = false,
    val image: ProjectImage? = null,
    /* The same site captured at phone width. */
    val mobileImage: ProjectImage? = null,
) {
    val isLive get() = !liveUrl.isNullOrBlank()
    val displayUrl get() = liveUrl?.removePrefix("https://")?.removePrefix("http://")?.trimEnd('/') ?: "$slug.build"
}

/* The request form's choices, served by the site so both forms always accept the same values. */
@Serializable
data class LeadOptions(
    val projectTypes: List<String>,
    val budgets: List<String>,
    val timelines: List<String>,
) {
    companion object {
        /* Used until the first successful load — same lists as lib/lead-schema.ts. */
        val Default = LeadOptions(
            projectTypes = listOf("New website", "Redesign of an existing site", "Booking / appointment system", "Online store", "Something else"),
            budgets = listOf("Under €1,000", "€1,000 - €3,000", "€3,000 - €7,000", "Not sure yet"),
            timelines = listOf("Whenever it's ready", "Within a month", "Within 2 weeks", "It's urgent"),
        )
    }
}

/* GET /api/projects */
@Serializable
data class Feed(val projects: List<Project>, val leadOptions: LeadOptions)

/* POST /api/leads — the same request the website form sends, tagged as coming from the app. */
@Serializable
data class LeadRequest(
    val name: String,
    val email: String,
    val phone: String,
    val business: String,
    val projectType: String,
    val budget: String,
    val timeline: String,
    val message: String,
    val projectRef: String,
    val consent: Boolean,
    val source: String = "android",
)

/* A published app version (GET /api/app/version), same shape as the Paulaner app's. */
@Serializable
data class Release(
    val versionCode: Int,
    val versionName: String,
    val url: String,
    val sha256: String,
    val sizeBytes: Long,
    val notes: String = "",
    val mandatory: Boolean = false,
)

@Serializable
data class UpdateInfo(val latest: Release? = null, val minSupportedVersionCode: Int = 0, val mustUpdate: Boolean = false)
