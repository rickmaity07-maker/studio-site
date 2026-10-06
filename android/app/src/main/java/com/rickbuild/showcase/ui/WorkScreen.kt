package com.rickbuild.showcase.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.rickbuild.showcase.ui.theme.Palette

private const val ALL = "All"

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun WorkScreen(vm: AppViewModel) {
    val feed by vm.feed.collectAsStateWithLifecycle()
    var category by rememberSaveable { mutableStateOf(ALL) }

    // Same order as the site's filter: only categories that have projects.
    val categories = listOf(ALL) + feed.projects.map { it.category }.distinct()
    val shown = if (category == ALL) feed.projects else feed.projects.filter { it.category == category }

    when {
        feed.loading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = Palette.Live)
        }

        feed.projects.isEmpty() -> ErrorState(feed.error ?: "No projects yet.") { vm.load() }

        else -> PullToRefreshBox(isRefreshing = feed.refreshing, onRefresh = { vm.load(refresh = true) }) {
            LazyColumn(
                contentPadding = PaddingValues(start = 20.dp, end = 20.dp, top = 28.dp, bottom = 32.dp),
                verticalArrangement = Arrangement.spacedBy(18.dp),
                modifier = Modifier.fillMaxSize(),
            ) {
                item {
                    Column {
                        Eyebrow("Web development studio · Schweinfurt")
                        Spacer(Modifier.height(10.dp))
                        Text("Every build, live and clickable", style = MaterialTheme.typography.displaySmall)
                        Spacer(Modifier.height(10.dp))
                        Text(
                            "Real client websites. Open any of them and click around, then tell me what your business needs.",
                            style = MaterialTheme.typography.bodyLarge,
                            color = Palette.Muted,
                        )
                        Spacer(Modifier.height(20.dp))
                        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            categories.forEach { c -> Chip(c, selected = c == category) { category = c } }
                        }
                        if (feed.error != null) {
                            Spacer(Modifier.height(12.dp))
                            Text(feed.error!!, style = MaterialTheme.typography.labelSmall, color = Palette.Signal)
                        }
                    }
                }
                items(shown, key = { it.slug }) { project ->
                    ProjectCard(project, project.image?.url?.let(vm.api::absolute)) {
                        vm.open(Screen.Detail(project.slug))
                    }
                }
            }
        }
    }
}

@Composable
fun ErrorState(message: String, onRetry: () -> Unit) {
    Column(
        Modifier.fillMaxSize().padding(32.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Eyebrow("Offline?")
        Spacer(Modifier.height(10.dp))
        Text(message, style = MaterialTheme.typography.bodyLarge, color = Palette.Muted, textAlign = TextAlign.Center)
        Spacer(Modifier.height(20.dp))
        PrimaryButton("Try again", onClick = onRetry)
    }
}
