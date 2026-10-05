package com.rickbuild.showcase.ui

import androidx.activity.compose.BackHandler
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.rickbuild.showcase.ui.theme.ButtonLabelStyle
import com.rickbuild.showcase.ui.theme.Palette

@Composable
fun App(vm: AppViewModel = viewModel()) {
    val stack by vm.stack.collectAsStateWithLifecycle()
    val screen = stack.last()

    BackHandler(enabled = stack.size > 1) { vm.back() }

    // The live demo gets the whole screen, like opening the site itself.
    val showBar = screen !is Screen.Demo
    val onRequestTab = stack.first() is Screen.Request

    Scaffold(
        containerColor = Palette.Ink,
        bottomBar = {
            if (showBar) {
                Column {
                    HorizontalDivider(color = Palette.Line)
                    NavigationBar(containerColor = Palette.Ink, tonalElevation = 0.dp) {
                        Tab("◆", "Work", selected = !onRequestTab) { vm.showTab(Screen.Work) }
                        Tab("→", "Start a project", selected = onRequestTab) { vm.showTab(Screen.Request()) }
                    }
                }
            }
        },
    ) { padding ->
        AnimatedContent(
            targetState = screen,
            transitionSpec = { fadeIn() togetherWith fadeOut() },
            modifier = Modifier.fillMaxSize().padding(if (showBar) padding else PaddingValues()),
            label = "screen",
        ) { current ->
            when (current) {
                Screen.Work -> WorkScreen(vm)
                is Screen.Detail -> ProjectScreen(vm, current.slug)
                is Screen.Demo -> DemoScreen(vm, current.slug)
                is Screen.Request -> RequestScreen(vm, current.projectRef)
            }
        }
    }
}

@Composable
private fun RowScope.Tab(glyph: String, label: String, selected: Boolean, onClick: () -> Unit) {
    NavigationBarItem(
        selected = selected,
        onClick = onClick,
        icon = { Text(glyph, fontSize = 18.sp) },
        label = { Text(label.uppercase(), style = ButtonLabelStyle.copy(fontSize = 11.sp)) },
        colors = NavigationBarItemDefaults.colors(
            selectedIconColor = Palette.Live,
            selectedTextColor = Palette.Live,
            indicatorColor = Palette.Live.copy(alpha = 0.12f),
            unselectedIconColor = Palette.Muted,
            unselectedTextColor = Palette.Muted,
        ),
    )
}
