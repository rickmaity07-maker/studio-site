package com.rickbuild.showcase.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.rickbuild.showcase.data.Services
import com.rickbuild.showcase.ui.theme.Mono
import com.rickbuild.showcase.ui.theme.Palette
import com.rickbuild.showcase.updates.UpdateState
import kotlinx.coroutines.launch

private val STAGES = listOf(
    "Discover" to "A short call about your business, your customers, and what the site actually needs to do.",
    "Design" to "A direction built around your brand, not a template.",
    "Build" to "Production code from the first commit, with proper data handling and security rules.",
    "Launch" to "Deployed, tested on real phones, and handed to you as a live demo before your customers see it.",
)

/* The website's home page, rebuilt for a phone. */
@Composable
fun HomeScreen(vm: AppViewModel) {
    val feed by vm.feed.collectAsStateWithLifecycle()
    // Live projects without a screenshot still show, with their colour gradient.
    val live = feed.projects.filter { it.isLive }
    val featured = (live.filter { it.featured } + live.filterNot { it.featured }).take(6)

    LazyColumn(
        contentPadding = PaddingValues(top = 28.dp, bottom = 48.dp),
        verticalArrangement = Arrangement.spacedBy(44.dp),
        modifier = Modifier.fillMaxSize(),
    ) {
        item { Hero(vm) }
        item {
            when {
                featured.isNotEmpty() -> Featured(vm, featured, live.size)
                feed.loading -> Box(Modifier.fillMaxWidth().height(260.dp), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = Palette.Live)
                }
                // Couldn't load and nothing saved: say so, with a way to retry.
                feed.error != null -> Column(
                    Modifier.padding(horizontal = 20.dp).fillMaxWidth().clip(RoundedCornerShape(18.dp))
                        .background(Palette.Surface).border(1.dp, Palette.Line, RoundedCornerShape(18.dp)).padding(20.dp),
                ) {
                    Eyebrow("Offline?")
                    Spacer(Modifier.height(8.dp))
                    Text(feed.error!!, style = MaterialTheme.typography.bodyLarge, color = Palette.Muted)
                    Spacer(Modifier.height(16.dp))
                    PrimaryButton("Try again") { vm.load() }
                }
                else -> Unit
            }
        }
        item { Capabilities(live.size) }
        item { Process() }
        item { Closing(vm) }
        item { Footer(vm) }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun Hero(vm: AppViewModel) {
    Column(Modifier.padding(horizontal = 20.dp)) {
        Eyebrow("Web studio in Schweinfurt")
        Spacer(Modifier.height(12.dp))
        Text(
            buildAnnotatedString {
                append("Websites you can actually ")
                withStyle(SpanStyle(color = Palette.Live)) { append("click") }
                append(" through.")
            },
            style = MaterialTheme.typography.displaySmall,
        )
        Spacer(Modifier.height(12.dp))
        Text(
            "Every project here is a real, working build. Open one, click around, then tell me what your business needs.",
            style = MaterialTheme.typography.bodyLarge,
            color = Palette.Muted,
        )
        Spacer(Modifier.height(22.dp))
        // Wraps to a second row instead of squeezing when the font is large.
        FlowRow(horizontalArrangement = Arrangement.spacedBy(10.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            PrimaryButton("See the work") { vm.showTab(Screen.Work) }
            GhostButton("Start a project") { vm.showTab(Screen.Request()) }
        }
    }
}

@Composable
private fun Featured(vm: AppViewModel, featured: List<com.rickbuild.showcase.data.Project>, liveCount: Int) {
    val pager = rememberPagerState { featured.size }
    val scope = rememberCoroutineScope()
    Column {
        Row(
            Modifier.fillMaxWidth().padding(horizontal = 20.dp),
            verticalAlignment = Alignment.Bottom,
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Text("$liveCount builds you can open right now.", style = MaterialTheme.typography.titleLarge, modifier = Modifier.weight(1f))
            Spacer(Modifier.width(12.dp))
            Text(
                "EVERY BUILD →",
                fontFamily = Mono,
                style = MaterialTheme.typography.labelSmall,
                color = Palette.Live,
                modifier = Modifier.clip(RoundedCornerShape(4.dp)).clickable { vm.showTab(Screen.Work) }.padding(4.dp),
            )
        }
        Spacer(Modifier.height(16.dp))
        HorizontalPager(
            state = pager,
            contentPadding = PaddingValues(horizontal = 20.dp),
            pageSpacing = 12.dp,
        ) { page ->
            val p = featured[page]
            val shape = RoundedCornerShape(18.dp)
            Column(
                Modifier.fillMaxWidth().clip(shape).background(Palette.Surface).border(1.dp, Palette.Line, shape)
                    .clickable { vm.open(Screen.Detail(p.slug)) },
            ) {
                ChromeBar(p.displayUrl)
                ProjectArt(p, p.image?.url?.let(vm.api::absolute), Modifier.fillMaxWidth().aspectRatio(16f / 10f))
                Column(Modifier.padding(16.dp)) {
                    Text(p.name, style = MaterialTheme.typography.titleMedium)
                    Text(p.tagline, style = MaterialTheme.typography.bodyMedium, color = Palette.Muted, maxLines = 1)
                }
            }
        }
        Spacer(Modifier.height(14.dp))
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.Center) {
            repeat(featured.size) { i ->
                val on = pager.currentPage == i
                Box(
                    Modifier.padding(horizontal = 3.dp).height(6.dp).width(if (on) 18.dp else 6.dp).clip(CircleShape)
                        .background(if (on) Palette.Live else Palette.Line)
                        .clickable { scope.launch { pager.animateScrollToPage(i) } },
                )
            }
        }
    }
}

@Composable
private fun Capabilities(liveCount: Int) {
    Column(Modifier.padding(horizontal = 20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("What I build for local businesses.", style = MaterialTheme.typography.headlineMedium)
        Spacer(Modifier.height(4.dp))
        CapabilityCard("Bookings that run themselves", "Appointments, SMS confirmations, waitlists and a staff calendar.")
        LanguageCard()
        CapabilityCard("Online stores", "Search, basket, pickup or delivery, built around how your shop already works.")
        CapabilityCard("Your own admin portal", "Change menus, prices, hours and texts yourself. No developer needed for the small stuff.")
        val shape = RoundedCornerShape(18.dp)
        Column(Modifier.fillMaxWidth().clip(shape).background(Palette.Surface).border(1.dp, Palette.Line, shape).padding(20.dp)) {
            LiveDot(true)
            Spacer(Modifier.height(10.dp))
            Text("$liveCount", style = MaterialTheme.typography.displaySmall.copy(fontSize = MaterialTheme.typography.displaySmall.fontSize * 1.6f))
            Text("client sites live and clickable, from bars to barbershops.", style = MaterialTheme.typography.bodyMedium, color = Palette.Muted)
        }
    }
}

@Composable
private fun CapabilityCard(title: String, body: String) {
    val shape = RoundedCornerShape(18.dp)
    Column(Modifier.fillMaxWidth().clip(shape).background(Palette.Surface).border(1.dp, Palette.Line, shape).padding(20.dp)) {
        Text(title, style = MaterialTheme.typography.titleMedium)
        Spacer(Modifier.height(6.dp))
        Text(body, style = MaterialTheme.typography.bodyMedium, color = Palette.Muted)
    }
}

/* The same working DE/EN switch as on the website. */
@Composable
private fun LanguageCard() {
    var english by rememberSaveable { mutableStateOf(false) }
    val shape = RoundedCornerShape(18.dp)
    Column(Modifier.fillMaxWidth().clip(shape).background(Palette.Surface).border(1.dp, Palette.Line, shape).padding(20.dp)) {
        Text("German and English, built in", style = MaterialTheme.typography.titleMedium)
        Spacer(Modifier.height(6.dp))
        Text("The language switches instantly, without a reload. Try it.", style = MaterialTheme.typography.bodyMedium, color = Palette.Muted)
        Spacer(Modifier.height(14.dp))
        Row(Modifier.clip(CircleShape).border(1.dp, Palette.Line, CircleShape).padding(3.dp)) {
            listOf(false to "DE", true to "EN").forEach { (isEn, label) ->
                val on = english == isEn
                Box(
                    Modifier.clip(CircleShape).background(if (on) Palette.Live else Color.Transparent)
                        .clickable { english = isEn }.padding(horizontal = 16.dp, vertical = 6.dp),
                ) {
                    Text(label, fontFamily = Mono, style = MaterialTheme.typography.labelSmall, color = if (on) Palette.Ink else Palette.Muted)
                }
            }
        }
        Spacer(Modifier.height(12.dp))
        Text(if (english) "Open today until 11 pm" else "Heute geöffnet bis 23 Uhr", style = MaterialTheme.typography.bodyMedium, color = Palette.Muted)
        Spacer(Modifier.height(8.dp))
        Box(Modifier.clip(CircleShape).background(Palette.Text).padding(horizontal = 18.dp, vertical = 9.dp)) {
            Text((if (english) "Book a table" else "Tisch reservieren").uppercase(), fontFamily = Mono, style = MaterialTheme.typography.labelSmall, color = Palette.Ink)
        }
    }
}

@Composable
private fun Process() {
    Column(Modifier.padding(horizontal = 20.dp)) {
        Eyebrow("How a project runs")
        Spacer(Modifier.height(10.dp))
        Text("Four stages, no surprises.", style = MaterialTheme.typography.headlineMedium)
        Spacer(Modifier.height(18.dp))
        STAGES.forEachIndexed { i, (title, body) ->
            Row(Modifier.padding(bottom = 18.dp)) {
                Text("0${i + 1}", fontFamily = Mono, style = MaterialTheme.typography.labelSmall, color = Palette.Live, modifier = Modifier.padding(top = 4.dp).width(34.dp))
                Column {
                    Text(title, style = MaterialTheme.typography.titleLarge)
                    Spacer(Modifier.height(4.dp))
                    Text(body, style = MaterialTheme.typography.bodyMedium, color = Palette.Muted)
                }
            }
        }
    }
}

@Composable
private fun Closing(vm: AppViewModel) {
    val shape = RoundedCornerShape(22.dp)
    Column(
        Modifier.padding(horizontal = 20.dp).fillMaxWidth().clip(shape)
            .background(Brush.verticalGradient(listOf(Palette.Surface, Palette.Live.copy(alpha = 0.10f))))
            .border(1.dp, Palette.Line, shape).padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text("Have a business that needs a site?", style = MaterialTheme.typography.headlineMedium, textAlign = TextAlign.Center)
        Spacer(Modifier.height(10.dp))
        Text("Tell me what it needs to do. You get a working demo before anything goes live.", style = MaterialTheme.typography.bodyMedium, color = Palette.Muted, textAlign = TextAlign.Center)
        Spacer(Modifier.height(18.dp))
        PrimaryButton("Start a project") { vm.showTab(Screen.Request()) }
    }
}

@Composable
private fun Footer(vm: AppViewModel) {
    val uri = LocalUriHandler.current
    val updater = Services.updater
    val scope = rememberCoroutineScope()
    var checkResult by remember { mutableStateOf<String?>(null) }
    Column(Modifier.padding(horizontal = 20.dp)) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text("◆", color = Palette.Live)
            Spacer(Modifier.width(8.dp))
            Text("Rick.build", style = MaterialTheme.typography.titleMedium)
        }
        Spacer(Modifier.height(14.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(18.dp)) {
            FooterLink("Website") { uri.openUri(vm.api.absolute("/")) }
            FooterLink("Privacy") { uri.openUri(vm.api.absolute("/privacy")) }
            FooterLink("Impressum") { uri.openUri(vm.api.absolute("/impressum")) }
        }
        if (updater != null) {
            Spacer(Modifier.height(18.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("Version ${updater.currentVersionName}", style = MaterialTheme.typography.labelSmall, color = Palette.Muted)
                Spacer(Modifier.width(14.dp))
                FooterLink("Check for updates") {
                    scope.launch {
                        checkResult = "Checking…"
                        val state = updater.check()
                        checkResult = if (state is UpdateState.Idle) "You have the newest version." else null
                    }
                }
            }
            checkResult?.let {
                Spacer(Modifier.height(6.dp))
                Text(it, style = MaterialTheme.typography.labelSmall, color = Palette.Live)
            }
        }
    }
}

@Composable
private fun FooterLink(text: String, onClick: () -> Unit) {
    Text(
        text.uppercase(),
        fontFamily = Mono,
        style = MaterialTheme.typography.labelSmall,
        color = Palette.Text.copy(alpha = 0.8f),
        modifier = Modifier.clip(RoundedCornerShape(4.dp)).clickable(onClick = onClick).padding(vertical = 6.dp),
    )
}
