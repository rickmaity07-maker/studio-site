package com.rickbuild.showcase.ui

import androidx.activity.compose.BackHandler
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.layout.Box
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
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.rickbuild.showcase.ui.theme.ButtonLabelStyle
import com.rickbuild.showcase.ui.theme.Palette
import kotlinx.coroutines.flow.StateFlow

@Composable
fun App(link: StateFlow<String?>? = null, onLinkHandled: () -> Unit = {}, vm: AppViewModel = viewModel()) {
    val stack by vm.stack.collectAsStateWithLifecycle()
    val screen = stack.last()

    // A rickbuild.vercel.app link that opened the app: go straight there.
    val pending = link?.collectAsStateWithLifecycle()?.value
    LaunchedEffect(pending) {
        if (pending != null) {
            vm.openLink(pending)
            onLinkHandled()
        }
    }

    BackHandler(enabled = stack.size > 1) { vm.back() }

    // The live demo gets the whole screen, like opening the site itself.
    val showBar = screen !is Screen.Demo
    val root = stack.first()

    Scaffold(
        containerColor = Palette.Ink,
        bottomBar = {
            if (showBar) {
                Column {
                    HorizontalDivider(color = Palette.Line)
                    NavigationBar(containerColor = Palette.Ink, tonalElevation = 0.dp) {
                        Tab("◆", "Home", selected = root is Screen.Home) { vm.showTab(Screen.Home) }
                        Tab("≡", "Work", selected = root is Screen.Work) { vm.showTab(Screen.Work) }
                        // Short label: it must fit on one line, also with large system fonts (common on MIUI).
                        Tab("→", "Start", selected = root is Screen.Request) { vm.showTab(Screen.Request()) }
                    }
                }
            }
        },
    ) { padding ->
        Box(Modifier.fillMaxSize().padding(if (showBar) padding else PaddingValues())) {
            AnimatedContent(
                targetState = screen,
                transitionSpec = { fadeIn() togetherWith fadeOut() },
                modifier = Modifier.fillMaxSize(),
                label = "screen",
            ) { current ->
                when (current) {
                    Screen.Home -> HomeScreen(vm)
                    Screen.Work -> WorkScreen(vm)
                    is Screen.Detail -> ProjectScreen(vm, current.slug)
                    is Screen.Demo -> DemoScreen(vm, current.slug)
                    is Screen.Request -> RequestScreen(vm, current.projectRef)
                }
            }
            // Update offers sit above every screen (a mandatory one covers it).
            UpdateLayer(Modifier.align(Alignment.BottomCenter))
        }
    }
}

@Composable
private fun RowScope.Tab(glyph: String, label: String, selected: Boolean, onClick: () -> Unit) {
    NavigationBarItem(
        selected = selected,
        onClick = onClick,
        icon = { Text(glyph, fontSize = 18.sp) },
        label = { Text(label.uppercase(), style = ButtonLabelStyle.copy(fontSize = 11.sp), maxLines = 1) },
        colors = NavigationBarItemDefaults.colors(
            selectedIconColor = Palette.Live,
            selectedTextColor = Palette.Live,
            indicatorColor = Palette.Live.copy(alpha = 0.12f),
            unselectedIconColor = Palette.Muted,
            unselectedTextColor = Palette.Muted,
        ),
    )
}
