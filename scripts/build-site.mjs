import { readFile, writeFile, unlink } from "node:fs/promises";
import { join } from "node:path";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");

const pages = [
  { src: "screen-4.html", out: "index.html", active: "home", title: "الرئيسية" },
  { src: "screen-5.html", out: "about.html", active: "about", title: "عن الطبيب" },
  { src: "screen-1.html", out: "credentials.html", active: "credentials", title: "المؤهلات" },
  { src: "screen-7.html", out: "services.html", active: "services", title: "الخدمات" },
  { src: "screen-2.html", out: "ivf.html", active: "ivf", title: "الحقن المجهري" },
  { src: "screen-8.html", out: "contact.html", active: "contact", title: "اتصل بنا" },
];

const links = pages.map(({ out, active, title }) => ({
  key: active,
  href: out,
  label: title,
}));

function navLink(item, active) {
  const isActive = item.key === active;
  const base =
    "font-body-md text-body-md transition-colors py-1 block md:inline whitespace-nowrap";
  const activeCls =
    "text-primary dark:text-primary-fixed font-bold border-b-2 border-primary";
  const idleCls =
    "text-on-surface-variant dark:text-outline hover:text-primary";
  return `<a class="${base} ${isActive ? activeCls : idleCls}" href="${item.href}">${item.label}</a>`;
}

function buildHeader(active) {
  const desktopNav = links.map((l) => navLink(l, active)).join("\n");
  const mobileNav = links
    .map(
      (l) =>
        `<a class="block py-3 px-4 rounded-lg hover:bg-surface-container-low ${l.key === active ? "text-primary font-bold" : "text-on-surface-variant"}" href="${l.href}">${l.label}</a>`
    )
    .join("\n");

  return `<header class="fixed top-0 w-full z-50 bg-white/80 dark:bg-surface/80 backdrop-blur-md border-b border-surface-container shadow-[0px_12px_32px_rgba(77,166,255,0.08)]">
<div class="flex flex-row-reverse justify-between items-center w-full px-gutter md:px-20 py-4 gap-4">
<a href="index.html" class="font-headline-md text-headline-md text-primary dark:text-primary-fixed font-bold tracking-tight shrink-0">د. محمود صابر</a>
<nav class="hidden lg:flex flex-row-reverse gap-4 xl:gap-6 items-center overflow-x-auto" aria-label="التنقل الرئيسي">
${desktopNav}
</nav>
<div class="flex items-center gap-3 shrink-0">
<button type="button" data-book class="hidden sm:inline-flex bg-primary text-on-primary px-5 py-2.5 rounded-full font-label-md text-label-md hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all shadow-md">احجز الآن</button>
<button type="button" id="menu-toggle" class="md:hidden w-10 h-10 flex items-center justify-center rounded-full border border-outline-variant text-primary" aria-expanded="false" aria-controls="mobile-menu" aria-label="فتح القائمة">
<span class="material-symbols-outlined">menu</span>
</button>
</div>
</div>
<div id="mobile-menu" class="hidden lg:hidden border-t border-surface-container bg-white/95 backdrop-blur-md px-gutter py-4 flex flex-col gap-1">
${mobileNav}
<button type="button" data-book class="mt-2 w-full bg-primary text-on-primary py-3 rounded-full font-label-md">احجز الآن</button>
</div>
</header>`;
}

function buildFooter() {
  const footerLinks = links
    .map(
      (l) =>
        `<a class="hover:text-primary transition-colors font-body-md text-body-md text-on-surface-variant" href="${l.href}">${l.label}</a>`
    )
    .join("\n");

  return `<footer class="w-full rounded-t-xl bg-surface-container-low dark:bg-inverse-surface">
<div class="flex flex-col gap-stack-md px-gutter md:px-20 py-section-gap w-full">
<div class="flex flex-col md:flex-row-reverse justify-between items-center gap-stack-md">
<a href="index.html" class="font-headline-md text-headline-md text-primary dark:text-primary-fixed">د. محمود صابر</a>
<nav class="flex flex-wrap flex-row-reverse justify-center gap-x-6 gap-y-2" aria-label="روابط الموقع">
${footerLinks}
</nav>
</div>
<div class="flex flex-col md:flex-row-reverse justify-between items-center gap-4 pt-6 border-t border-outline-variant/30">
<div class="flex flex-row-reverse flex-wrap justify-center gap-6 font-body-md text-body-md text-on-surface-variant">
<a class="hover:text-primary transition-colors" href="contact.html">الشروط والأحكام</a>
<a class="hover:text-primary transition-colors" href="contact.html">سياسة الخصوصية</a>
<a class="hover:text-primary transition-colors" href="contact.html">الأسئلة الشائعة</a>
</div>
<p class="font-body-md text-body-md text-on-surface-variant">جميع الحقوق محفوظة © 2026 د. محمود صابر</p>
</div>
</div>
</footer>`;
}

const appointmentForm = `<div class="p-8 rounded-[24px] bg-white border border-[#DFF4FF] shadow-clinic">
<h2 class="font-headline-md text-headline-md text-on-surface mb-2">احجزي موعداً</h2>
<p class="font-body-md text-body-md text-on-surface-variant mb-6">املئي النموذج وسنتواصل معكِ لتأكيد الموعد.</p>
<form id="appointment-form" class="space-y-5">
<input type="hidden" name="service" value="">
<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
<label class="block">
<span class="font-label-md text-label-md text-on-surface-variant mb-1 block">الاسم الكامل</span>
<input name="name" required class="w-full rounded-xl border border-[#DFF4FF] px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" placeholder="اسمكِ الكامل">
</label>
<label class="block">
<span class="font-label-md text-label-md text-on-surface-variant mb-1 block">رقم الهاتف</span>
<input name="phone" required type="tel" dir="ltr" class="w-full rounded-xl border border-[#DFF4FF] px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" placeholder="+20 ...">
</label>
</div>
<div>
<span class="font-label-md text-label-md text-on-surface-variant mb-2 block">نوع الخدمة</span>
<div class="flex flex-wrap gap-2">
<button type="button" data-service-btn="متابعة حمل" class="px-4 py-2 rounded-full border border-[#DFF4FF] text-on-surface-variant text-sm hover:border-primary transition-colors">متابعة حمل</button>
<button type="button" data-service-btn="ولادة" class="px-4 py-2 rounded-full border border-[#DFF4FF] text-on-surface-variant text-sm hover:border-primary transition-colors">ولادة</button>
<button type="button" data-service-btn="حقن مجهري" class="px-4 py-2 rounded-full border border-[#DFF4FF] text-on-surface-variant text-sm hover:border-primary transition-colors">حقن مجهري</button>
<button type="button" data-service-btn="مناظير" class="px-4 py-2 rounded-full border border-[#DFF4FF] text-on-surface-variant text-sm hover:border-primary transition-colors">مناظير</button>
<button type="button" data-service-btn="استشارة" class="px-4 py-2 rounded-full border border-[#DFF4FF] text-on-surface-variant text-sm hover:border-primary transition-colors">استشارة</button>
</div>
</div>
<label class="block">
<span class="font-label-md text-label-md text-on-surface-variant mb-1 block">ملاحظات (اختياري)</span>
<textarea name="message" rows="3" class="w-full rounded-xl border border-[#DFF4FF] px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none" placeholder="أي تفاصيل إضافية..."></textarea>
</label>
<button type="submit" class="w-full gradient-primary text-white py-4 rounded-full font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all">
<span class="material-symbols-outlined">send</span>
إرسال طلب الحجز عبر واتساب
</button>
</form>
</div>`;

function stripInlineScripts(html) {
  return html
    .replace(/<script>\s*\/\/ Simple scroll header effect[\s\S]*?<\/script>/g, "")
    .replace(/<script>\s*\/\/ Simple scroll reveal interaction[\s\S]*?<\/script>/g, "")
    .replace(/<script>\s*\/\/ Simple scroll interaction for header[\s\S]*?<\/script>/g, "")
    .replace(/<script>\s*\/\/ Simple Interaction for Type Selection[\s\S]*?<\/script>/g, "")
    .replace(/<script>\s*\/\/ Add reveal animations on scroll[\s\S]*?<\/script>/g, "");
}

function patchHtml(html, active) {
  let out = stripInlineScripts(html);

  out = out.replace(/<header[\s\S]*?<\/header>/, buildHeader(active));
  out = out.replace(/<footer[\s\S]*?<\/footer>/, buildFooter());

  out = out.replace(
    /<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=Be+Vietnam[^"]+" rel="stylesheet"\/?>/,
    (match) =>
      match.includes("IBM+Plex+Sans+Arabic")
        ? match
        : match.replace(
            "IBM+Plex+Sans:wght",
            "IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=IBM+Plex+Sans:wght"
          )
  );

  if (!out.includes("IBM Plex Sans Arabic")) {
    out = out.replace(
      "</style>",
      `\n        body { font-family: 'IBM Plex Sans Arabic', sans-serif; scroll-behavior: smooth; }\n    </style>`
    );
  }

  out = out.replace(
    /<div class="lg:col-span-7">\s*<\/div>/,
    `<div class="lg:col-span-7">${appointmentForm}</div>`
  );

  out = out.replace(/href="#about"/g, 'href="about.html"');
  out = out.replace(/href="#services"/g, 'href="services.html"');
  out = out.replace(/href="#contact"/g, 'href="contact.html"');

  out = out.replace(
    /<button class="w-fit text-primary font-bold flex items-center gap-2 group">[\s\S]*?<\/button>/,
    `<a href="credentials.html" class="w-fit text-primary font-bold flex items-center gap-2 group">
                        اعرفي المزيد عن مسيرتنا الطبية
                        <span class="material-symbols-outlined group-hover:translate-x-[-4px] transition-transform">arrow_back</span>
</a>`
  );

  out = out.replace(
    'class="bg-primary text-on-primary px-8 py-4 rounded-full font-label-md text-label-md flex items-center justify-center gap-2 hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all shadow-lg"',
    'data-whatsapp class="bg-primary text-on-primary px-8 py-4 rounded-full font-label-md text-label-md flex items-center justify-center gap-2 hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all shadow-lg"'
  );

  out = out.replace(
    /<button class="bg-white text-primary px-10 py-4 rounded-full font-label-md text-label-md hover:bg-surface-container-low transition-colors">\s*احجز استشارة تخصصية\s*<\/button>/g,
    '<button type="button" data-book class="bg-white text-primary px-10 py-4 rounded-full font-label-md text-label-md hover:bg-surface-container-low transition-colors">احجز استشارة تخصصية</button>'
  );

  out = out.replace(
    /<button class="border-2 border-white text-white px-10 py-4 rounded-full font-label-md text-label-md hover:bg-white\/10 transition-colors">\s*تواصل معنا مباشرة\s*<\/button>/g,
    '<a href="contact.html" class="border-2 border-white text-white px-10 py-4 rounded-full font-label-md text-label-md hover:bg-white/10 transition-colors inline-flex items-center justify-center">تواصل معنا مباشرة</a>'
  );

  
  out = out.replace(
    /<button class="w-14 h-14 bg-primary text-on-primary rounded-full shadow-2xl[\s\S]*?<\/button>/,
    `<a href="https://wa.me/201234567890" target="_blank" rel="noopener" data-whatsapp class="fixed bottom-8 left-8 z-50 md:hidden w-14 h-14 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-transform" aria-label="تواصل عبر واتساب">
<span class="material-symbols-outlined text-[30px]" style="font-variation-settings: 'FILL' 1;">chat</span>
</a>`
  );

  out = out.replace(
    /<button class="fixed bottom-8 left-8 z-40 bg-primary text-on-primary w-14 h-14 rounded-full shadow-2xl[\s\S]*?<\/button>/,
    `<a href="contact.html" data-book class="fixed bottom-8 left-8 z-40 bg-primary text-on-primary w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all md:bottom-12 md:left-12" aria-label="احجز موعد">
<span class="material-symbols-outlined text-2xl" style="font-variation-settings: 'FILL' 1;">calendar_month</span>
</a>`
  );

  if (active === "about" || active === "credentials") {
    out = out.replace(
      /<section class="([^"]*?)transition-all duration-1000 opacity-100 translate-y-0"/g,
      '<section data-reveal class="$1transition-all duration-1000 opacity-0 translate-y-10"'
    );
  }

  if (active === "services") {
    out = out.replace(
      '<div class="flex flex-row-reverse gap-4">\n\n\n</div>',
      `<div class="flex flex-row-reverse gap-4 flex-wrap">
<a href="ivf.html" class="bg-primary text-on-primary px-6 py-3 rounded-full font-label-md text-label-md hover:opacity-90 transition-all">الحقن المجهري والمناظير</a>
<a href="contact.html" data-book class="border-2 border-primary text-primary px-6 py-3 rounded-full font-label-md text-label-md hover:bg-primary/5 transition-all">احجزي موعد</a>
</div>`
    );
  }

  if (active === "ivf") {
    out = out.replace(
      '<div class="flex flex-row-reverse gap-4">\n</div>',
      `<div class="flex flex-row-reverse gap-4 flex-wrap">
<a href="services.html" class="border-2 border-primary text-primary px-6 py-3 rounded-full font-label-md text-label-md hover:bg-primary/5 transition-all">كل الخدمات</a>
<a href="contact.html" data-book class="bg-primary text-on-primary px-6 py-3 rounded-full font-label-md text-label-md hover:opacity-90 transition-all">احجزي استشارة</a>
</div>`
    );
  }

  if (!out.includes('assets/js/main.js')) {
    out = out.replace(
      "</body>",
      '<script src="assets/js/main.js"></script>\n</body>'
    );
  }

  return out;
}

const manifest = { pages: [] };

for (const page of pages) {
  const raw = await readFile(join(SRC, page.src), "utf8");
  const built = patchHtml(raw, page.active);
  await writeFile(join(ROOT, page.out), built, "utf8");
  manifest.pages.push({
    file: page.out,
    title: page.title,
    source: `src/${page.src}`,
  });
  console.log(`  ✓ ${page.out} ← ${page.src}`);
}

await writeFile(
  join(ROOT, "pages.json"),
  JSON.stringify(manifest, null, 2),
  "utf8"
);

console.log("\n6 pages restored and linked.");
