package com.rickbuild.showcase.ui

import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import coil3.compose.AsyncImage
import com.rickbuild.showcase.data.Project
import com.rickbuild.showcase.ui.theme.ButtonLabelStyle
import com.rickbuild.showcase.ui.theme.EyebrowStyle
import com.rickbuild.showcase.ui.theme.Mono
import com.rickbuild.showcase.ui.theme.Palette

fun accentColor(hex: String): Color =
    runCatching { Color(android.graphics.Color.parseColor(hex)) }.getOrDefault(Palette.Live)

@Composable
fun Eyebrow(text: String, modifier: Modifier = Modifier, color: Color = Palette.Muted) {
    Text(text.uppercase(), style = EyebrowStyle.copy(color = color), modifier = modifier)
}

/* "● LIVE DEMO" (blinking) or "● IN BUILD", as on the site's cards. */
@Composable
fun LiveDot(live: Boolean, modifier: Modifier = Modifier) {
    val blink by rememberInfiniteTransition(label = "blink").animateFloat(
        initialValue = 1f,
        targetValue = 0.35f,
        animationSpec = infiniteRepeatable(tween(800), RepeatMode.Reverse),
        label = "alpha",
    )
    val color = if (live) Palette.Live else Palette.Muted
    Row(modifier, verticalAlignment = Alignment.CenterVertically) {
        Box(
            Modifier.size(6.dp).alpha(if (live) blink else 0.5f).clip(CircleShape).background(color),
        )
        Spacer(Modifier.width(6.dp))
        Text(if (live) "LIVE DEMO" else "IN BUILD", style = EyebrowStyle.copy(color = color, letterSpacing = EyebrowStyle.letterSpacing))
    }
}

/* The fake browser bar with traffic lights and an address field. */
@Composable
fun ChromeBar(url: String, modifier: Modifier = Modifier, trailing: @Composable () -> Unit = {}) {
    Row(
        modifier.fillMaxWidth().background(Palette.Surface2).padding(horizontal = 12.dp, vertical = 9.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        Row(horizontalArrangement = Arrangement.spacedBy(5.dp)) {
            listOf(Color(0xFFFF5F57), Color(0xFFFEBC2E), Color(0xFF28C840)).forEach {
                Box(Modifier.size(9.dp).clip(CircleShape).background(it.copy(alpha = 0.7f)))
            }
        }
        Box(
            Modifier.weight(1f).clip(RoundedCornerShape(6.dp)).background(Palette.Ink)
                .border(1.dp, Palette.Line, RoundedCornerShape(6.dp)).padding(horizontal = 10.dp, vertical = 4.dp),
        ) {
            Text(url, style = MaterialTheme.typography.labelSmall, color = Palette.Muted, maxLines = 1, overflow = TextOverflow.Ellipsis)
        }
        trailing()
    }
}

/* Screenshot (or the accent gradient when there is none), framed like the site's cards. */
@Composable
fun ProjectArt(project: Project, imageUrl: String?, modifier: Modifier = Modifier) {
    val accent = accentColor(project.accent)
    Box(
        modifier.background(Brush.linearGradient(listOf(accent.copy(alpha = 0.22f), Palette.Ink))),
    ) {
        if (imageUrl != null) {
            AsyncImage(
                model = imageUrl,
                contentDescription = "Screenshot of ${project.name}",
                contentScale = ContentScale.Crop,
                alignment = Alignment.TopCenter,
                modifier = Modifier.fillMaxSize(),
            )
        } else {
            Box(
                Modifier.align(Alignment.TopEnd).padding(8.dp).size(120.dp).alpha(0.35f)
                    .background(Brush.radialGradient(listOf(accent, Color.Transparent))),
            )
        }
    }
}

@Composable
fun ProjectCard(project: Project, imageUrl: String?, onClick: () -> Unit) {
    val shape = RoundedCornerShape(18.dp)
    Column(
        Modifier.fillMaxWidth().clip(shape).background(Palette.Surface).border(1.dp, Palette.Line, shape).clickable(onClick = onClick),
    ) {
        Box(Modifier.fillMaxWidth().aspectRatio(4f / 3f)) {
            ProjectArt(project, imageUrl, Modifier.fillMaxSize())
            Box(Modifier.fillMaxSize().background(Brush.verticalGradient(listOf(Color.Transparent, Palette.Ink.copy(alpha = 0.75f)))))
            Row(
                Modifier.align(Alignment.BottomCenter).padding(14.dp).fillMaxWidth().clip(RoundedCornerShape(8.dp))
                    .background(Palette.Ink.copy(alpha = 0.7f)).border(1.dp, Palette.Line, RoundedCornerShape(8.dp))
                    .padding(horizontal = 10.dp, vertical = 7.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                Row(horizontalArrangement = Arrangement.spacedBy(5.dp)) {
                    repeat(3) { Box(Modifier.size(7.dp).clip(CircleShape).background(Color.White.copy(alpha = 0.15f))) }
                }
                Text(project.displayUrl, style = MaterialTheme.typography.labelSmall, color = Palette.Muted, maxLines = 1, overflow = TextOverflow.Ellipsis, modifier = Modifier.padding(start = 12.dp))
            }
        }
        Column(Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.Top) {
                Column(Modifier.weight(1f)) {
                    Text(project.name, style = MaterialTheme.typography.titleMedium)
                    Text(project.tagline, style = MaterialTheme.typography.bodyMedium, color = Palette.Muted)
                }
                Spacer(Modifier.width(12.dp))
                LiveDot(project.isLive, Modifier.padding(top = 4.dp))
            }
            Spacer(Modifier.size(12.dp))
            Text(
                "${project.category}  ·  ${project.year}".uppercase(),
                style = EyebrowStyle.copy(letterSpacing = EyebrowStyle.letterSpacing / 2),
                color = Palette.Text.copy(alpha = 0.7f),
            )
        }
    }
}

@Composable
fun PrimaryButton(text: String, modifier: Modifier = Modifier, enabled: Boolean = true, onClick: () -> Unit) {
    Box(
        modifier.clip(CircleShape).background(if (enabled) Palette.Live else Palette.Live.copy(alpha = 0.35f))
            .clickable(enabled = enabled, onClick = onClick).padding(horizontal = 22.dp, vertical = 13.dp),
        contentAlignment = Alignment.Center,
    ) {
        Text(text.uppercase(), style = ButtonLabelStyle, color = Palette.Ink)
    }
}

@Composable
fun GhostButton(text: String, modifier: Modifier = Modifier, onClick: () -> Unit) {
    Box(
        modifier.clip(CircleShape).border(1.dp, Palette.Line, CircleShape).clickable(onClick = onClick)
            .padding(horizontal = 22.dp, vertical = 13.dp),
        contentAlignment = Alignment.Center,
    ) {
        Text(text.uppercase(), style = ButtonLabelStyle, color = Palette.Text)
    }
}

@Composable
fun Chip(text: String, selected: Boolean = false, onClick: (() -> Unit)? = null) {
    val shape = CircleShape
    Box(
        Modifier.clip(shape)
            .background(if (selected) Palette.Live.copy(alpha = 0.1f) else Color.Transparent)
            .border(1.dp, if (selected) Palette.Live.copy(alpha = 0.5f) else Palette.Line, shape)
            .then(if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier)
            .padding(horizontal = 14.dp, vertical = 7.dp),
    ) {
        Text(text.uppercase(), fontFamily = Mono, style = MaterialTheme.typography.labelSmall, color = if (selected) Palette.Live else Palette.Muted)
    }
}

@Composable
fun BackLink(text: String, onClick: () -> Unit) {
    Text(
        "← ${text.uppercase()}",
        style = ButtonLabelStyle,
        color = Palette.Muted,
        modifier = Modifier.clip(RoundedCornerShape(4.dp)).clickable(onClick = onClick).padding(vertical = 6.dp),
    )
}
