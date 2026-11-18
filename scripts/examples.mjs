// Real, anonymised examples of Mykola's written feedback (replaces the invented sample case).
// Shown on the landing page and the PM interview prep page. Original text is Ukrainian; the English is a translation.
// Rules: no names, sectors, years or numbers from a client's situation. Do not add text without the author's OK.
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const EXAMPLES = {
  en: {
    sum: 'See what the written feedback looks like',
    lead: 'Two real examples, anonymised. Written in Ukrainian; translated here.',
    consult: {
      title: 'After a consultation on planning',
      intro: 'To sum up, in planning I look at:',
      items: [
        ['Goals and success criteria', 'we went through this at the meeting, but I was left with the impression that this is your growth area'],
        ['Scope and priorities', 'all clear here'],
        ['Deadlines, budget, quality requirements', 'clarity and understanding of the processes here too'],
        ['Completeness of estimates and their assumptions', 'this is where you could go deeper, on several aspects'],
        ['Team competencies and availability', 'all OK here'],
        ['Dependencies, sequence and parallel work', 'depends on the team and many nuances, but I am sure you know how to handle it. If not, we can add this item too, so the picture is complete'],
        ['Workload of each person by period', 'this is pure arithmetic and we gave it little attention. When I optimise processes, this is exactly the area that is a gold mine'],
        ['Integration, testing, acceptance and release', 'it all comes down to clear DoD and success criteria, which we get from the first point. Once there is clarity, planning the last phases was not a problem for you'],
        ['Checkpoints and readiness criteria', 'all clear here, you work by deliverables'],
        ['Risks, reserves and external dependencies', 'a possible area for further discussion'],
        ['Owners and order of approvals', 'formalities that sometimes play a significant role and should be moved from assumptions to certainty'],
        ['Monitoring execution and revising the plan after changes', 'I heard the key phrase that you are launching change management. If so, this is clear'],
      ],
      closing: 'Is there a need for an additional session?',
    },
    interview: {
      title: 'After a mock interview',
      covers: 'Every feedback covers: soft skills, hard skills, theory, practical experience, body language and voice, clarity of answers, tools and methods, motivation and goals. Two excerpts:',
      excerpts: [
        'Your answers had a lot of generalisations. I missed concrete examples, especially when I asked for them directly. Instead of "I would find out his motivation" say "I would check my notes on this developer to remember what motivates him best, or ask HR, or ask him directly".',
        'You respond to vacancies on job sites. These are so-called "cold applications". I advise moving to "hot" work: post on LinkedIn from time to time that you are looking for a job. Write what kind of job you want and what you expect, and about yourself: what you can do, which problems you solve, what you have achieved.',
      ],
    },
    note: 'Real feedback, anonymised, shared with the clients\' permission.',
  },
  uk: {
    sum: 'Подивіться, як виглядає письмовий відгук',
    lead: 'Два реальні приклади, знеособлені.',
    consult: {
      title: 'Після консультації з планування',
      intro: 'Якщо підвести підсумок, то в процесі планування я звертаю увагу на:',
      items: [
        ['Цілі та критерії успіху', 'цей момент ми на зустрічі розбирали, але у мене залишилось враження, що це є вашою зоною розвитку'],
        ['Скоуп і пріоритети', 'тут все чітко'],
        ['Строки, бюджет, вимоги до якості', 'тут теж була визначеність та розуміння процесів'],
        ['Повноту оцінок та їхні припущення', 'ось тут можна було б попрацювати більш глибоко по різних аспектах'],
        ['Компетенції й доступність команди', 'тут все ОК'],
        ['Залежності, послідовність і паралельність робіт', 'залежить від команди та багатьох нюансів, але я впевнений, що з цим ви вмієте розібратися. Якщо ні, то можна цей пункт також додати, щоб була повна визначеність'],
        ['Навантаження кожної людини по періодах', 'це чиста математика, ми мало уваги приділили цьому моменту. Насправді, коли я займаюсь оптимізацією процесів, то саме цей напрямок є золотою жилою для роботи'],
        ['Інтеграція, тестування, приймання та реліз', 'тут все зводиться до чітких DoD та Success Criteria, які ми отримуємо з першого пункту. Я помітив, що коли визначеність вже є, то з плануванням останніх фаз у вас не було труднощів'],
        ['Контрольні точки й критерії готовності', 'тут все чітко, працюєте по делівераблах'],
        ['Ризики, резерви та зовнішні залежності', 'можлива зона для додаткового обговорення'],
        ['Відповідальні та порядок погоджень', 'формальності, які іноді мають значущу роль і мають бути переведені з припущень у визначеність'],
        ['Контроль виконання й перегляд плану після змін', 'я почув від вас ключове "запускаю Change Management". Якщо це так, то тут все чітко'],
      ],
      closing: 'Чи є потреба в додатковій сесії?',
    },
    interview: {
      title: 'Після пробної співбесіди',
      covers: 'Кожен відгук охоплює: софт скіли, хард скіли, теоретичні знання, практичний досвід, мову тіла й голос, чіткість відповідей, інструменти та методи, мотивацію та цілі. Два уривки:',
      excerpts: [
        'У твоїх відповідях було багато узагальнень. Мені не вистачало конкретних прикладів, особливо коли я прямо їх просив. Замість "я б з\'ясував його мотивацію" – "я б звернувся до своїх нотаток по цьому розробнику, щоб згадати, що його мотивує найкраще, або запитав би у HR, або запитав би прямо".',
        'Ти відгукуєшся на вакансії на сайтах. Це так звані "холодні відгуки". Раджу перейти на роботу "по-гарячому" – публікуй час від часу на LinkedIn інформацію про те, що шукаєш роботу. Пиши про те, яку роботу шукаєш, чого очікуєш, та про себе – що вмієш, які проблеми вирішуєш, які досягнення маєш.',
      ],
    },
    note: 'Реальні відгуки, знеособлені, опубліковані за згодою клієнтів.',
  },
};

// kind: 'both' (landing) or 'interview' (prep page)
export function examplesHtml(k, kind = 'both') {
  const e = EXAMPLES[k];
  const consult = `<p><strong>${esc(e.consult.title)}</strong></p><p>${esc(e.consult.intro)}</p><ul class="tick">${e.consult.items.map((x) => `<li><strong>${esc(x[0])}:</strong> ${esc(x[1])}</li>`).join('')}</ul><p><em>${esc(e.consult.closing)}</em></p>`;
  const interview = `<p><strong>${esc(e.interview.title)}</strong></p><p>${esc(e.interview.covers)}</p>${e.interview.excerpts.map((x) => `<blockquote>${esc(x)}</blockquote>`).join('')}`;
  const body = kind === 'interview' ? interview : `${interview}<hr style="border:0;border-top:1px solid var(--line,#e5e7e2);margin:18px 0">${consult}`;
  return `<details class="qz-more" style="margin-top:22px"><summary>${esc(e.sum)}</summary>
        <div class="panel sample"><p class="note">${esc(e.lead)}</p>${body}<p class="note">${esc(e.note)}</p></div>
      </details>`;
}
