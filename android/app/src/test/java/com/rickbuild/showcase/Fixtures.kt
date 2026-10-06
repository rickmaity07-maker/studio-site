package com.rickbuild.showcase

/* The /api/projects response shape the website serves, trimmed to three projects. */
object Fixtures {
    const val FEED = """
    {
      "projects": [
        {"slug":"bar-05","name":"Bar-05","tagline":"Cocktail bar","category":"Hospitality","year":"2026",
         "stack":["Next.js","Neon Postgres"],"description":"A late-night bar site.",
         "liveUrl":"https://the-bar-project.vercel.app","embeddable":false,"accent":"#FF6B35","featured":true,
         "image":{"id":"abc","url":"/api/images/abc"}},
        {"slug":"rebo-salon","name":"Rebo Salon","tagline":"Barbershop booking","category":"Beauty & Booking","year":"2025",
         "stack":["Next.js"],"description":"A booking platform.",
         "liveUrl":"https://rebo-salon.vercel.app/","embeddable":false,"accent":"#E0B12E"},
        {"slug":"vespre","name":"Vespre","tagline":"Perfume store","category":"E-commerce","year":"2026",
         "stack":[],"description":"Not hosted yet.","accent":"#7A6A53","someFutureField":42}
      ],
      "leadOptions": {
        "projectTypes":["New website","Online store"],
        "budgets":["Under €1,000","€1,000 - €3,000"],
        "timelines":["Within a month"]
      }
    }
    """
}
