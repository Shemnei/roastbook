import OpenAI from "openai"

const apiKey = process.env.OPENAI_API_KEY

const openai = apiKey
  ? new OpenAI({
      apiKey,
      baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
    })
  : null

const visionModel = process.env.OPENAI_VISION_MODEL || "gpt-4o"

export function isVisionEnabled(): boolean {
  return openai !== null
}

export interface ExtractedBeanInfo {
  name?: string
  roaster?: string
  origin?: string
  region?: string
  farm?: string
  variety?: string
  process?: string
  roastLevel?: "light" | "medium_light" | "medium" | "medium_dark" | "dark"
  roastDate?: string
  notes?: string
}

export async function extractBeanInfoFromImage(
  imageBase64: string,
  mimeType: string = "image/jpeg"
): Promise<ExtractedBeanInfo> {
  if (!openai) {
    return {}
  }

  const response = await openai.chat.completions.create({
    model: visionModel,
    messages: [
      {
        role: "system",
        content: `You are a coffee expert assistant. Extract coffee bean information from product images (bags, labels, packaging).
Return a JSON object with the following fields (omit fields if not visible/readable):
- name: the coffee name/blend name
- roaster: the roasting company name
- origin: country of origin (e.g., "Ethiopia", "Colombia")
- region: specific region within the country (e.g., "Yirgacheffe", "Huila")
- farm: farm or producer name if specified
- variety: coffee variety (e.g., "Bourbon", "Gesha", "SL28")
- process: processing method, must be one of: "washed", "natural", "honey", "anaerobic", "wet_hulled", "carbonic_maceration", "other"
- roastLevel: one of "light", "medium_light", "medium", "medium_dark", "dark"
- roastDate: roast date in ISO format (YYYY-MM-DD) if visible
- notes: ALL flavor descriptions, tasting notes, and flavor profiles go here. Format as "Tasting notes: [notes]" if tasting notes are found. Include any cupping scores, SCA scores, or quality descriptors.

Only include fields where you can clearly read the information. Do not guess.`,
      },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${imageBase64}`,
            },
          },
          {
            type: "text",
            text: "Extract the coffee bean information from this image.",
          },
        ],
      },
    ],
    response_format: { type: "json_object" },
    max_tokens: 1000,
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    return {}
  }

  try {
    return JSON.parse(content) as ExtractedBeanInfo
  } catch {
    return {}
  }
}


