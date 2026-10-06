package com.rickbuild.showcase.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.rickbuild.showcase.data.Api
import com.rickbuild.showcase.data.FeedCache
import com.rickbuild.showcase.data.ApiException
import com.rickbuild.showcase.data.LeadOptions
import com.rickbuild.showcase.data.LeadRequest
import com.rickbuild.showcase.data.Project
import com.rickbuild.showcase.data.Services
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

/* Where the user is. The last entry of the back stack is on screen. */
sealed interface Screen {
    data object Home : Screen
    data object Work : Screen
    data class Detail(val slug: String) : Screen
    data class Demo(val slug: String) : Screen
    data class Request(val projectRef: String? = null) : Screen
}

data class FeedState(
    val loading: Boolean = true,
    val refreshing: Boolean = false,
    val projects: List<Project> = emptyList(),
    val options: LeadOptions = LeadOptions.Default,
    val error: String? = null,
    /* Showing projects saved on the device because the site couldn't be reached. */
    val offline: Boolean = false,
)

sealed interface SendState {
    data object Idle : SendState
    data object Sending : SendState
    data object Sent : SendState
    data class Failed(val message: String) : SendState
}

class AppViewModel(
    val api: Api = Services.api,
    private val cache: FeedCache? = Services.cache,
) : ViewModel() {

    private val _feed = MutableStateFlow(FeedState())
    val feed: StateFlow<FeedState> = _feed.asStateFlow()

    private val _stack = MutableStateFlow<List<Screen>>(listOf(Screen.Home))
    val stack: StateFlow<List<Screen>> = _stack.asStateFlow()

    private val _send = MutableStateFlow<SendState>(SendState.Idle)
    val send: StateFlow<SendState> = _send.asStateFlow()

    init {
        // Saved projects first (instant, works offline), then the live list.
        viewModelScope.launch {
            val saved = cache?.read() ?: return@launch
            _feed.update {
                if (it.projects.isEmpty() && it.loading) {
                    it.copy(loading = false, refreshing = true, projects = saved.projects, options = saved.leadOptions)
                } else it
            }
        }
        load()
    }

    fun load(refresh: Boolean = false) {
        _feed.update { it.copy(loading = !refresh && it.projects.isEmpty(), refreshing = refresh || it.projects.isNotEmpty(), error = null) }
        viewModelScope.launch {
            try {
                val feed = api.feed()
                _feed.update { FeedState(loading = false, projects = feed.projects, options = feed.leadOptions) }
                cache?.write(feed)
            } catch (e: ApiException) {
                _feed.update {
                    it.copy(loading = false, refreshing = false, error = e.message, offline = it.projects.isNotEmpty())
                }
            }
        }
    }

    /*
      A rickbuild.vercel.app link opened from outside (App Links):
      /work/<slug> opens that project, /work the list, /request the form.
    */
    fun openLink(path: String) {
        val parts = path.trim('/').split('/').filter { it.isNotBlank() }
        when {
            parts.firstOrNull() == "work" && parts.size >= 2 -> _stack.value = listOf(Screen.Work, Screen.Detail(parts[1]))
            parts.firstOrNull() == "work" -> _stack.value = listOf(Screen.Work)
            parts.firstOrNull() == "request" -> showTab(Screen.Request())
        }
    }

    fun project(slug: String) = _feed.value.projects.find { it.slug == slug }

    /* The project after this one, wrapping around — like "Next project" on the site. */
    fun nextProject(slug: String): Project? {
        val list = _feed.value.projects
        val i = list.indexOfFirst { it.slug == slug }
        return if (i < 0 || list.size < 2) null else list[(i + 1) % list.size]
    }

    fun open(screen: Screen) = _stack.update { it + screen }

    /* Swaps the top screen, e.g. "Next project" without growing the stack. */
    fun replace(screen: Screen) = _stack.update { it.dropLast(1) + screen }

    fun back(): Boolean {
        if (_stack.value.size <= 1) return false
        _stack.update { it.dropLast(1) }
        return true
    }

    /* Bottom-bar tabs reset the stack to their root. */
    fun showTab(root: Screen) {
        if (root is Screen.Request) _send.value = SendState.Idle
        _stack.value = listOf(root)
    }

    fun sendLead(lead: LeadRequest) {
        if (_send.value == SendState.Sending) return
        _send.value = SendState.Sending
        viewModelScope.launch {
            _send.value = try {
                api.sendLead(lead)
                SendState.Sent
            } catch (e: ApiException) {
                SendState.Failed(e.message ?: "Something went wrong. Please try again.")
            }
        }
    }

    fun resetSend() {
        _send.value = SendState.Idle
    }
}
