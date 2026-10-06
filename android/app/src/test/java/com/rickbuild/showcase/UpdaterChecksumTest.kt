package com.rickbuild.showcase

import com.rickbuild.showcase.updates.Updater
import org.junit.Assert.assertEquals
import org.junit.Test

class UpdaterChecksumTest {
    @Test
    fun `sha256 matches the standard digest the website publishes`() {
        val file = kotlin.io.path.createTempFile("apk", ".bin").toFile()
        file.writeText("abc")
        // SHA-256("abc"), as Node's crypto and sha256sum produce it (lowercase hex).
        assertEquals("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad", Updater.sha256(file))
        file.delete()
    }
}
