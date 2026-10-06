package com.rickbuild.showcase.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import com.rickbuild.showcase.ui.theme.Palette

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun ProjectScreen(vm: AppViewModel, slug: String) {
    val project = vm.project(slug) ?: return ErrorState("This project isn't available any more.") { vm.back() }
    val next = vm.nextProject(slug)
    val shape = RoundedCornerShape(18.dp)

    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(horizontal = 20.dp, vertical = 20.dp)) {
        BackLink("All work") { vm.back() }
        Spacer(Modifier.height(18.dp))

        Eyebrow("${project.category} · ${project.year}")
        Spacer(Modifier.height(8.dp))
        Text(project.name, style = MaterialTheme.typography.displaySmall)
        Spacer(Modifier.height(6.dp))
        Text(project.tagline, style = MaterialTheme.typography.bodyLarge, color = Palette.Muted)
        Spacer(Modifier.height(12.dp))
        LiveDot(project.isLive)

        Spacer(Modifier.height(18.dp))
        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            project.stack.forEach { Chip(it) }
        }

        Spacer(Modifier.height(18.dp))
        Text(project.description, style = MaterialTheme.typography.bodyLarge, color = Palette.Text.copy(alpha = 0.85f))

        // Preview in browser chrome; tapping it opens the live demo.
        Spacer(Modifier.height(24.dp))
        Column(
            Modifier.fillMaxWidth().clip(shape).border(1.dp, Palette.Line, shape).background(Palette.Surface)
                .then(if (project.isLive) Modifier.clickable { vm.open(Screen.Demo(slug)) } else Modifier),
        ) {
            ChromeBar(project.displayUrl)
            ProjectArt(project, project.image?.url?.let(vm.api::absolute), Modifier.fillMaxWidth().aspectRatio(4f / 3f))
        }

        Spacer(Modifier.height(16.dp))
        if (project.isLive) {
            PrimaryButton("Open live demo", Modifier.fillMaxWidth()) { vm.open(Screen.Demo(slug)) }
        } else {
            Text(
                "This build isn't hosted yet. As soon as it goes live, you can click through it right here.",
                style = MaterialTheme.typography.bodyMedium,
                color = Palette.Muted,
            )
        }

        // "Want something like this?" — same call to action as the website.
        Spacer(Modifier.height(28.dp))
        Column(
            Modifier.fillMaxWidth().clip(shape).border(1.dp, Palette.Line, shape).background(Palette.Surface).padding(22.dp),
        ) {
            Text("Want something like this?", style = MaterialTheme.typography.titleLarge)
            Spacer(Modifier.height(6.dp))
            Text(
                "Tell me about your business and I'll put together something built for it, not a copy of this one.",
                style = MaterialTheme.typography.bodyMedium,
                color = Palette.Muted,
            )
            Spacer(Modifier.height(16.dp))
            GhostButton("Request this style") { vm.open(Screen.Request(project.name)) }
        }

        if (next != null) {
            Spacer(Modifier.height(16.dp))
            Row(
                Modifier.fillMaxWidth().clip(RoundedCornerShape(14.dp)).border(1.dp, Palette.Line, RoundedCornerShape(14.dp))
                    .clickable { vm.replace(Screen.Detail(next.slug)) }.padding(horizontal = 20.dp, vertical = 16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                Eyebrow("Next project")
                Text("${next.name} →", style = MaterialTheme.typography.titleMedium)
            }
        }
        Spacer(Modifier.height(12.dp))
    }
}
