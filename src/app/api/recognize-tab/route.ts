import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  ...(process.env.ANTHROPIC_BASE_URL && { baseURL: process.env.ANTHROPIC_BASE_URL }),
});

// Full analysis prompt for first page
const FULL_PROMPT = `你是专业吉他六线谱分析师。仔细分析这张吉他六线谱图片，以合法 JSON 返回（不要有多余文字）：
{
  "title": "曲名（如有）",
  "key": "调性如 C大调",
  "timeSignature": "拍号如 4/4",
  "tempo": "速度提示文字如 Moderately（无则空字符串）",
  "bpm": 120,
  "capo": "变调夹如 CAPO 4，无则 null",
  "scale": "音阶如 C大调自然音阶",
  "techniques": ["技法列表"],
  "analysis": "整体分析与学习建议（3-5句中文）",
  "chordProgression": ["C","Am","F","G"],
  "chordChart": {
    "sections": [
      {
        "name": "前奏",
        "strumPattern": "6 4 3 2 1 2",
        "lines": [
          {
            "lyrics": "", "measures": 1,
            "chords": [{"chord":"C","position":0,"beat":0}],
            "tabSteps": [
              {"strings": [null,null,null,null,"x","x"]},
              {"strings": ["x","x","x","x",null,null]},
              {"strings": [null,3,2,null,null,null]},
              {"strings": [0,2,0,0,2,null]}
            ]
          }
        ]
      },
      {
        "name": "主歌",
        "strumPattern": "↓ ↓↑ ↑ ↓↑",
        "lines": [
          { "lyrics": "世界如果被残酷攻击", "measures": 2, "chords": [{"chord":"C","position":0,"beat":0},{"chord":"Am","position":4,"beat":4},{"chord":"G","position":8,"beat":8}] },
          { "lyrics": "只要给我一个电话亭", "measures": 2, "chords": [{"chord":"C","position":0,"beat":0},{"chord":"F","position":4,"beat":4},{"chord":"G","position":8,"beat":8}] }
        ]
      }
    ]
  }
}
【重要规则】：
1. chordChart 覆盖本页所有段落，不漏任何一个段落
2. lyrics 精确照抄谱子上该行的歌词文字，器乐行留空字符串 ""
3. position 是和弦标注位置对应歌词字符索引（从0起）；若和弦在歌词结束后（行尾空白处），用歌词长度作为 position
4. 【关键】每一行的每一个和弦变换都必须记录，包括行中间和行尾的和弦，不能遗漏
5. 器乐行（前奏/间奏等无歌词段落）每个和弦的 position 均为 0
6. bpm 填写谱面标注的数字速度（如 ♩=120 则填 120），无法确定则填 null
7. section 级 strumPattern：扫弦用 ↓ ↑ 符号（如"↓ ↓↑ ↑ ↓↑"），分解/指弹用弦号（如"6 4 3 2 1 2"，6=低音E弦1=高音e弦），无法确定则省略
8. 【精准品格网格 tabSteps】对于器乐行（lyrics=""），必须提取 tabSteps 数组——每个元素对应六线谱上的一个垂直时间步（一个音/一组同时弹的音），格式：
   {"strings": [s1, s2, s3, s4, s5, s6]}
   其中 strings[0]=第1弦(高音e)，strings[5]=第6弦(低音E)；值：品格数字(0=空弦, 1-24)、"x"=闷弦/不弹有声、null=该弦此步不触碰
   读取方法：逐列从左到右扫描六线谱，每列为一个步，记录每根弦的数字或×（多弦同时有值代表同时拨）；扫弦（×符号在多弦上）也照实记录为多弦 "x"
   歌词行无需 tabSteps
9. measures 填写该行跨越的小节数（通常为1），beat 填写和弦在本行内的拍子偏移（0起）
10. 返回纯 JSON，不要 markdown 代码块、不要注释`;

// Chord-only prompt for subsequent pages
const EXTRA_PAGE_PROMPT = `分析这张吉他六线谱图片，提取所有歌词与和弦对应关系，以合法 JSON 返回（不要有多余文字）：
{
  "sections": [
    {
      "name": "段落名如副歌",
      "strumPattern": "↓ ↓↑ ↑ ↓↑",
      "lines": [
        { "lyrics": "", "measures": 1, "chords": [{"chord":"C","position":0,"beat":0}], "tabSteps": [{"strings":[null,null,null,null,"x","x"]},{"strings":["x","x","x","x",null,null]},{"strings":[null,3,2,null,null,null]},{"strings":[0,2,0,0,2,null]}] },
        { "lyrics": "歌词文字", "measures": 1, "chords": [{"chord":"C","position":0,"beat":0},{"chord":"Am","position":4,"beat":4}] }
      ]
    }
  ]
}
【重要规则】：
1. 覆盖本页所有段落（前奏/主歌/副歌/间奏/尾奏等）
2. lyrics 精确照抄该行歌词，器乐行留空字符串 ""
3. position 是和弦标注对应歌词字符索引（从0起）；若和弦在行尾歌词之后，用歌词长度作为 position
4. 【关键】每行每个和弦变换都必须记录，包括行中间和行尾，不能遗漏任何一个和弦
5. 器乐行每个和弦 position 均为 0
6. section 级 strumPattern：扫弦用"↓ ↓↑ ↑ ↓↑"，分解和弦用弦号"6 4 3 2 1 2"，无法确定则省略
7. 【精准品格网格 tabSteps】器乐行（lyrics=""）必须提取 tabSteps：每元素 {"strings":[s1,s2,s3,s4,s5,s6]} 对应一个时间步，strings[0]=第1弦(高音e)→strings[5]=第6弦(低音E)，值为品格数字/\"x\"(闷弦)/null(不弹)。逐列从左到右扫描，多弦同列同时有值须全部填入（同时拨）。歌词行无需 tabSteps
8. measures 填写该行跨越的小节数（通常1），beat 填写和弦在本行内的拍子偏移（0起）
9. 返回纯 JSON，不要 markdown 代码块`;

const VALID_MEDIA_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;
type ValidMediaType = typeof VALID_MEDIA_TYPES[number];

async function fileToImageBlock(file: File): Promise<Anthropic.ImageBlockParam> {
  const mediaType: ValidMediaType = VALID_MEDIA_TYPES.includes(file.type as ValidMediaType)
    ? (file.type as ValidMediaType)
    : "image/jpeg";
  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  return { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } };
}

function parseJSON(text: string) {
  let t = text.trim();
  t = t.replace(/^```json\n?/, "").replace(/\n?```$/, "");
  t = t.replace(/^```\n?/, "").replace(/\n?```$/, "");
  return JSON.parse(t);
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: "未收到图片文件" }, { status: 400 });
    }
    if (files.length > 10) {
      return NextResponse.json({ error: "最多支持 10 页，请分批上传" }, { status: 400 });
    }

    // ── Step 1: Full analysis of page 1 ──────────────────────────────
    const block0 = await fileToImageBlock(files[0]);
    const res0 = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [{
        role: "user",
        content: [block0, { type: "text", text: FULL_PROMPT }],
      }],
    });

    const analysis = parseJSON((res0.content[0] as Anthropic.TextBlock).text);
    analysis.totalPages = files.length;

    // ── Step 2: Chord-only analysis for pages 2..N (sequential) ──────
    for (let i = 1; i < files.length; i++) {
      try {
        const block = await fileToImageBlock(files[i]);
        const res = await client.messages.create({
          model: "claude-sonnet-4-6",
          max_tokens: 2048,
          messages: [{
            role: "user",
            content: [block, { type: "text", text: EXTRA_PAGE_PROMPT }],
          }],
        });
        const extra = parseJSON((res.content[0] as Anthropic.TextBlock).text);
        if (extra.sections?.length) {
          analysis.chordChart.sections.push(...extra.sections);
        }
      } catch (e) {
        console.warn(`Page ${i + 1} analysis failed, skipping:`, e);
      }
    }

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Error analyzing tab:", error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `分析失败：${msg.slice(0, 100)}` },
      { status: 500 }
    );
  }
}
