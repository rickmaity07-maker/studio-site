import { NextResponse } from "next/server";

/*
  Android App Links: tells Android that the Rick.build app may open this
  site's project links. The fingerprint is the app's release signing
  certificate (~/.android-rick-build/release.jks), which is public by design;
  only an app signed with that key can claim the links.
*/
const RELEASE_CERT_SHA256 =
  "7E:C0:9D:03:DA:0B:42:16:FF:34:82:0B:76:FA:97:F0:E3:B9:EF:C4:73:12:08:2E:10:B1:A8:98:51:C2:29:4F";

export function GET() {
  return NextResponse.json(
    [
      {
        relation: ["delegate_permission/common.handle_all_urls"],
        target: {
          namespace: "android_app",
          package_name: "com.rickbuild.showcase",
          sha256_cert_fingerprints: [RELEASE_CERT_SHA256]
        }
      }
    ],
    { headers: { "Cache-Control": "public, max-age=3600" } }
  );
}
