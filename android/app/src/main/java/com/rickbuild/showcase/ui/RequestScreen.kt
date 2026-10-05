package com.rickbuild.showcase.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.rickbuild.showcase.data.LeadRequest
import com.rickbuild.showcase.ui.theme.EyebrowStyle
import com.rickbuild.showcase.ui.theme.Palette

private val EMAIL = Regex("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")

@Composable
fun RequestScreen(vm: AppViewModel, projectRef: String?) {
    val feed by vm.feed.collectAsStateWithLifecycle()
    val send by vm.send.collectAsStateWithLifecycle()
    val options = feed.options
    val uriHandler = LocalUriHandler.current

    var name by rememberSaveable { mutableStateOf("") }
    var email by rememberSaveable { mutableStateOf("") }
    var phone by rememberSaveable { mutableStateOf("") }
    var business by rememberSaveable { mutableStateOf("") }
    var projectType by rememberSaveable { mutableStateOf("") }
    var budget by rememberSaveable { mutableStateOf("") }
    var timeline by rememberSaveable { mutableStateOf("") }
    var message by rememberSaveable { mutableStateOf("") }
    var consent by rememberSaveable { mutableStateOf(false) }

    if (send == SendState.Sent) {
        return Sent(onDone = {
            vm.resetSend()
            vm.showTab(Screen.Work)
        })
    }

    val sending = send == SendState.Sending
    val complete = name.isNotBlank() && EMAIL.matches(email.trim()) && business.isNotBlank() &&
        projectType.isNotEmpty() && budget.isNotEmpty() && timeline.isNotEmpty() && consent

    Column(
        Modifier.fillMaxSize().verticalScroll(rememberScrollState()).imePadding().padding(horizontal = 20.dp, vertical = 20.dp),
    ) {
        if (projectRef != null) {
            BackLink("Back") { vm.back() }
            Spacer(Modifier.height(18.dp))
        } else {
            Spacer(Modifier.height(8.dp))
        }
        Eyebrow("Start a project")
        Spacer(Modifier.height(8.dp))
        Text("Tell me about your business", style = MaterialTheme.typography.displaySmall)
        Spacer(Modifier.height(10.dp))
        Text(
            "A few details are enough to get started — no jargon, no obligation. I read every request myself and reply within one business day.",
            style = MaterialTheme.typography.bodyLarge,
            color = Palette.Muted,
        )

        if (projectRef != null) {
            Spacer(Modifier.height(18.dp))
            Box(
                Modifier.fillMaxWidth().clip(RoundedCornerShape(10.dp)).background(Palette.Surface2)
                    .border(1.dp, Palette.Line, RoundedCornerShape(10.dp)).padding(horizontal = 14.dp, vertical = 10.dp),
            ) {
                Text(
                    buildAnnotatedString {
                        append("Referencing: ")
                        withStyle(SpanStyle(color = Palette.Text)) { append(projectRef) }
                    },
                    style = MaterialTheme.typography.labelSmall,
                    color = Palette.Muted,
                )
            }
        }

        Spacer(Modifier.height(22.dp))
        Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
            Field("Your name", name, { name = it }, capitalization = KeyboardCapitalization.Words)
            Field("Email", email, { email = it }, keyboard = KeyboardType.Email)
            Field("Phone (optional)", phone, { phone = it }, keyboard = KeyboardType.Phone)
            Field("Business name", business, { business = it }, capitalization = KeyboardCapitalization.Words)
            Select("Project type", projectType, options.projectTypes) { projectType = it }
            Select("Budget", budget, options.budgets) { budget = it }
            Select("Timeline", timeline, options.timelines) { timeline = it }
            Field("Anything else? (optional)", message, { message = it }, singleLine = false, capitalization = KeyboardCapitalization.Sentences)

            Row(verticalAlignment = Alignment.Top) {
                Checkbox(
                    checked = consent,
                    onCheckedChange = { consent = it },
                    colors = CheckboxDefaults.colors(checkedColor = Palette.Live, checkmarkColor = Palette.Ink, uncheckedColor = Palette.Muted),
                )
                Spacer(Modifier.width(4.dp))
                Column(Modifier.padding(top = 12.dp)) {
                    Text(
                        "I agree that Rick can store this information to get back to me about my request.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Palette.Muted,
                        modifier = Modifier.clickable { consent = !consent },
                    )
                    Text(
                        "Read the privacy notice",
                        style = MaterialTheme.typography.bodyMedium.copy(textDecoration = TextDecoration.Underline),
                        color = Palette.Text,
                        modifier = Modifier.padding(top = 4.dp).clickable { uriHandler.openUri(vm.api.absolute("/privacy")) },
                    )
                }
            }

            PrimaryButton(if (sending) "Sending…" else "Send request", Modifier.fillMaxWidth(), enabled = complete && !sending) {
                vm.sendLead(
                    LeadRequest(
                        name = name.trim(),
                        email = email.trim(),
                        phone = phone.trim(),
                        business = business.trim(),
                        projectType = projectType,
                        budget = budget,
                        timeline = timeline,
                        message = message.trim(),
                        projectRef = projectRef.orEmpty(),
                        consent = consent,
                    ),
                )
            }

            (send as? SendState.Failed)?.let {
                Text(it.message, style = MaterialTheme.typography.labelSmall, color = Palette.Signal)
            }
        }
        Spacer(Modifier.height(24.dp))
    }
}

@Composable
private fun Sent(onDone: () -> Unit) {
    Column(
        Modifier.fillMaxSize().padding(28.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Eyebrow("Request sent", color = Palette.Live)
        Spacer(Modifier.height(12.dp))
        Text("Got it — thank you.", style = MaterialTheme.typography.headlineMedium, textAlign = TextAlign.Center)
        Spacer(Modifier.height(10.dp))
        Text(
            "I read every request myself and reply within one business day, usually sooner.",
            style = MaterialTheme.typography.bodyLarge,
            color = Palette.Muted,
            textAlign = TextAlign.Center,
        )
        Spacer(Modifier.height(24.dp))
        GhostButton("Back to the work", onClick = onDone)
    }
}

@Composable
private fun fieldColors() = OutlinedTextFieldDefaults.colors(
    focusedBorderColor = Palette.Live,
    unfocusedBorderColor = Palette.Line,
    focusedContainerColor = Palette.Surface2,
    unfocusedContainerColor = Palette.Surface2,
    cursorColor = Palette.Live,
    focusedTextColor = Palette.Text,
    unfocusedTextColor = Palette.Text,
)

@Composable
private fun Label(text: String) {
    Text(text.uppercase(), style = EyebrowStyle.copy(letterSpacing = EyebrowStyle.letterSpacing / 2), modifier = Modifier.padding(bottom = 6.dp))
}

@Composable
private fun Field(
    label: String,
    value: String,
    onChange: (String) -> Unit,
    keyboard: KeyboardType = KeyboardType.Text,
    capitalization: KeyboardCapitalization = KeyboardCapitalization.None,
    singleLine: Boolean = true,
) {
    Column {
        Label(label)
        OutlinedTextField(
            value = value,
            onValueChange = onChange,
            singleLine = singleLine,
            minLines = if (singleLine) 1 else 4,
            keyboardOptions = KeyboardOptions(keyboardType = keyboard, capitalization = capitalization),
            shape = RoundedCornerShape(10.dp),
            colors = fieldColors(),
            modifier = Modifier.fillMaxWidth(),
        )
    }
}

@Composable
private fun Select(label: String, value: String, choices: List<String>, onSelect: (String) -> Unit) {
    var open by rememberSaveable { mutableStateOf(false) }
    Column {
        Label(label)
        Box {
            Row(
                Modifier.fillMaxWidth().clip(RoundedCornerShape(10.dp)).background(Palette.Surface2)
                    .border(1.dp, if (open) Palette.Live else Palette.Line, RoundedCornerShape(10.dp))
                    .clickable { open = true }.padding(horizontal = 16.dp, vertical = 17.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    value.ifEmpty { "Choose one" },
                    style = MaterialTheme.typography.bodyLarge,
                    color = if (value.isEmpty()) Palette.Muted else Palette.Text,
                    modifier = Modifier.weight(1f),
                )
                Text("▾", color = Palette.Muted)
            }
            DropdownMenu(expanded = open, onDismissRequest = { open = false }, containerColor = Palette.Surface2) {
                choices.forEach { choice ->
                    DropdownMenuItem(
                        text = { Text(choice, color = if (choice == value) Palette.Live else Palette.Text) },
                        onClick = {
                            onSelect(choice)
                            open = false
                        },
                    )
                }
            }
        }
    }
}
