/* Pinkas — bilingual (Yiddish / English) tzedakah manager. Demo. Plain JS, data in localStorage. */
(function(){
'use strict';

const KEY = 'pinkas-demo-v2';
const $ = (s, el=document) => el.querySelector(s);
const $$ = (s, el=document) => Array.from(el.querySelectorAll(s));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ------------------------------------------------------------------ icons (Lucide, ISC) */
const IC = {
  dash:'<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
  users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  money:'<rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>',
  pledge:'<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4M12 16h4M8 11h.01M8 16h.01"/>',
  target:'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  settings:'<path d="M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3M14 2v4M8 10v4M16 18v4"/>',
  search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  plus:'<path d="M5 12h14M12 5v14"/>',
  download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  printer:'<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/>',
  pencil:'<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
  trash:'<path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  x:'<path d="M18 6 6 18M6 6l12 12"/>',
  chev:'<path d="m9 18 6-6-6-6"/>',
  back:'<path d="m12 19-7-7 7-7M19 12H5"/>',
  reset:'<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  phone:'<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
  mail:'<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  pin:'<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  receipt:'<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/>',
  cal:'<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  file:'<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4M10 9H8M16 13H8M16 17H8"/>',
  coins:'<circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18M7 6h1v4M16.71 13.88l.7.71-2.82 2.82"/>',
};
const icon = (n, cls='') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${IC[n]||''}</svg>`;

/* ------------------------------------------------------------------ strings */
const T = {
yi:{
  appName:'פנקס', appSub:'צדקה פארוואלטונג', demo:'דעמא',
  nav_dash:'איבערבליק', nav_donors:'נדבנים', nav_donations:'נדבות', nav_pledges:'התחייבותן', nav_camps:'קאמפעינס', nav_settings:'סעטינגס',
  search_ph:'זוך א נדבן — נאמען, טעלעפאן, אימעיל…', search_none:'קיין נדבן נישט געטראפן', search_all:'זע אלע נדבנים',
  new_donation:'נייע נדבה', new_donor:'נייער נדבן', new_pledge:'נייע התחייבות', new_camp:'נייער קאמפעין',
  k_month:'דעם חודש', k_year:'דאס יאר {y}', k_donors:'נדבנים דאס יאר', k_pledges:'אפענע התחייבותן',
  vs_last:'קעגן פאריגן חודש', gifts:'{n} נדבות', new_donors:'{n} נייע נדבנים', from_n:'{n} התחייבותן', to_collect:'נאך צו באקומען',
  chart_title:'נדבות לויט חודש', chart_sub:'די לעצטע 12 חדשים',
  recent:'לעצטע נדבות', see_all:'זע אלע', camps_title:'קאמפעינס', by_method:'לויט באצאל-אופן', top_donors:'גרעסטע נדבנים דאס יאר',
  raised:'געזאמלט', goal:'ציל', of:'פון', days_left:'נאך {n} טעג', ended:'פארענדיגט', starts_in:'הייבט אן אין {n} טעג', ongoing:'אן א סוף-דאטום', no_goal:'אן א ציל', today:'היינט',
  m_cash:'קעש', m_check:'טשעק', m_card:'קארד', m_zelle:'זעל',
  check_no:'טשעק נומער', check_short:'#{n}',
  donors_sub:'{n} נדבנים · {a} דאס יאר',
  col_name:'נאמען', col_city:'שטאט', col_phone:'טעלעפאן', col_total:'סך הכל', col_count:'נדבות', col_last:'לעצטע נדבה',
  sort_total:'גרעסטע ערשט', sort_name:'לויט נאמען', sort_recent:'לעצטע נדבה ערשט',
  back_donors:'נדבנים', lifetime:'סך הכל געגעבן', this_year:'דאס יאר', gift_count:'צאל נדבות', open_balance:'שולדיג אויף התחייבותן',
  history:'נדבות', pledges:'התחייבותן', notes:'נאטיצן', statement:'סטעיטמענט {y}', edit:'ענדערן', del:'אויסמעקן',
  no_donations:'נאך קיין נדבות', no_pledges:'קיין התחייבותן', since:'נדבן זינט {d}',
  donations_sub:'{n} נדבות · {a}',
  p_all:'אלע צייטן', p_month:'דעם חודש', p_30:'לעצטע 30 טעג', p_year:'דאס יאר', p_last:'פאריגע יאר',
  all_camps:'אלע קאמפעינס', all_methods:'אלע באצאל-אופנים', search_don:'זוך נאמען, טשעק נומער, נאטיץ…',
  export:'עקספארט', total:'סך הכל', avg:'דורכשניט', count:'צאל', clear:'ריינמאכן', no_match:'גארנישט געטראפן', no_match_sub:'פרובירט טוישן די פילטערס',
  col_date:'דאטום', col_donor:'נדבן', col_camp:'קאמפעין', col_method:'באצאלט', col_amount:'סכום',
  receipt:'קבלה',
  f_donor:'נדבן', f_donor_ph:'שרייבט א נאמען…', f_add_new:'צולייגן „{q}“ אלס נייער נדבן', f_amount:'סכום', f_date:'דאטום', f_method:'באצאל-אופן',
  f_camp:'קאמפעין', f_none:'— אלגעמיין —', f_pledge:'רעכענען אויף א התחייבות', f_no_pledge:'— נישט —', f_note:'נאטיץ', f_note_ph:'למשל: לזכות…, לעילוי נשמת…',
  save:'אפהיטן', cancel:'בטל', edit_donation:'ענדערן נדבה', req:'דאס פעלד איז נויטיג', amt_req:'שרייבט א סכום', bal:'נאך שולדיג {a}',
  saved_don:'די נדבה איז אפגעהיטן', deleted:'אויסגעמעקט', confirm_title:'אויסמעקן?', yes_del:'יא, אויסמעקן',
  confirm_del_don:'די נדבה פון {a} פון {name} וועט ווערן אויסגעמעקט.',
  confirm_del_donor:'{name} וועט ווערן אויסגעמעקט, מיט {n} נדבות און {p} התחייבותן.',
  confirm_del_pl:'די התחייבות וועט ווערן אויסגעמעקט. די באצאלטע נדבות בלייבן.',
  confirm_del_camp:'דער קאמפעין וועט ווערן אויסגעמעקט. זיינע נדבות ווערן „אלגעמיין“.',
  f_name_yi:'נאמען אויף אידיש', f_name_en:'נאמען אויף ענגליש', f_phone:'טעלעפאן', f_email:'אימעיל', f_address:'אדרעס', f_city:'שטאט', f_notes:'נאטיצן',
  edit_donor:'ענדערן נדבן', name_req:'שרייבט כאטש איין נאמען', saved_donor:'דער נדבן איז אפגעהיטן',
  pl_sub:'{n} התחייבותן · {a} נאך שולדיג',
  pl_open:'אפן', pl_late:'פארשפעטיגט', pl_paid:'באצאלט', pl_all:'אלע',
  col_pledged:'צוגעזאגט', col_paid:'באצאלט', col_balance:'שולדיג', col_due:'ביז', col_progress:'פראגרעס',
  record_pay:'באצאלונג', f_due:'ביז ווען', edit_pledge:'ענדערן התחייבות', saved_pledge:'די התחייבות איז אפגעהיטן',
  pledged_total:'צוגעזאגט', collected:'אריינגענומען', outstanding:'נאך שולדיג', due_on:'ביז {d}', paid_in_full:'אינגאנצן באצאלט',
  camp_sub:'{n} קאמפעינס', f_goal:'ציל', f_start:'אנהייב', f_end:'סוף', saved_camp:'דער קאמפעין איז אפגעהיטן',
  donors_n:'נדבנים', gifts_n:'נדבות', avg_gift:'דורכשניט', view_donations:'זע נדבות', edit_camp:'ענדערן קאמפעין', f_camp_name_req:'שרייבט א נאמען',
  set_org:'ארגאניזאציע', set_org_sub:'דאס ווערט געדרוקט אויף יעדע קבלה.', org_yi:'נאמען אויף אידיש', org_en:'נאמען אויף ענגליש', org_addr:'אדרעס', org_ein:'טעקס נומער (EIN)',
  org_phone:'טעלעפאן', org_email:'אימעיל', signer:'אונטערגעשריבן דורך', receipt_note:'א שורה אונטן אויף דער קבלה',
  set_saved:'די סעטינגס זענען אפגעהיטן', set_data:'דאטא', set_data_sub:'אראפנעמען אלעס אלס CSV, עפנט זיך אין עקסעל.', export_don:'נדבות (CSV)', export_donors:'נדבנים (CSV)', export_pl:'התחייבותן (CSV)',
  reset:'צוריקשטעלן די דעמא דאטא', reset_desc:'מעקט אויס אלעס וואס איר האט צוגעלייגט אדער געטוישט, און שטעלט צוריק די ביישפיל-דאטא.', reset_done:'די דעמא דאטא איז צוריקגעשטעלט', reset_q:'אלע ענדערונגען וועלן פארלוירן גיין.',
  demo_note:'דאס איז א דעמא. אלע נעמען, טעלעפאנען און סכומים זענען אויסגעטראכט. די דאטא ווערט געהאלטן נאר אין אייער בראוזער.',
  language:'שפראך', about:'וועגן',
  r_title:'קבלה פאר א נדבה', r_no:'קבלה נומער', r_from:'באקומען פון', r_date:'דאטום', r_method:'באצאלט מיט', r_purpose:'צוועק', r_amount:'סכום',
  r_legal:'{org} איז א 501(c)(3) נישט-פראפיט ארגאניזאציע. פאר די נדבה האט מען נישט געגעבן קיין סחורה אדער סערוויסעס.',
  r_thanks:'יישר כח! המקום ימלא חסרונכם.', r_print:'דרוקן / PDF', r_back:'צוריק', r_sign:'אונטערשריפט',
  r_stmt:'יערליכע סטעיטמענט', r_stmt_for:'נדבות אין יאר {y}', r_total_y:'סך הכל {y}', r_general:'אלגעמיינע צדקה', ein:'EIN',
  saved:'אפגעהיטן', bsd:'בס״ד', r_preview:'זען א קבלה', r_pledge_pay:'באצאלונג אויף התחייבות',
},
en:{
  appName:'Pinkas', appSub:'Tzedakah manager', demo:'Demo',
  nav_dash:'Overview', nav_donors:'Donors', nav_donations:'Donations', nav_pledges:'Pledges', nav_camps:'Campaigns', nav_settings:'Settings',
  search_ph:'Find a donor — name, phone, email…', search_none:'No donor found', search_all:'See all donors',
  new_donation:'New donation', new_donor:'New donor', new_pledge:'New pledge', new_camp:'New campaign',
  k_month:'This month', k_year:'Year {y}', k_donors:'Donors this year', k_pledges:'Open pledges',
  vs_last:'vs. last month', gifts:'{n} gifts', new_donors:'{n} new donors', from_n:'{n} pledges', to_collect:'still to collect',
  chart_title:'Donations by month', chart_sub:'Last 12 months',
  recent:'Recent donations', see_all:'See all', camps_title:'Campaigns', by_method:'By payment method', top_donors:'Top donors this year',
  raised:'raised', goal:'goal', of:'of', days_left:'{n} days left', ended:'Ended', starts_in:'Starts in {n} days', ongoing:'Ongoing', no_goal:'No goal', today:'Today',
  m_cash:'Cash', m_check:'Check', m_card:'Credit card', m_zelle:'Zelle',
  check_no:'Check number', check_short:'#{n}',
  donors_sub:'{n} donors · {a} this year',
  col_name:'Name', col_city:'City', col_phone:'Phone', col_total:'Total', col_count:'Gifts', col_last:'Last gift',
  sort_total:'Largest first', sort_name:'By name', sort_recent:'Most recent',
  back_donors:'Donors', lifetime:'Lifetime giving', this_year:'This year', gift_count:'Gifts', open_balance:'Pledge balance',
  history:'Donations', pledges:'Pledges', notes:'Notes', statement:'{y} statement', edit:'Edit', del:'Delete',
  no_donations:'No donations yet', no_pledges:'No pledges', since:'Donor since {d}',
  donations_sub:'{n} donations · {a}',
  p_all:'All time', p_month:'This month', p_30:'Last 30 days', p_year:'This year', p_last:'Last year',
  all_camps:'All campaigns', all_methods:'All methods', search_don:'Search name, check #, note…',
  export:'Export', total:'Total', avg:'Average', count:'Count', clear:'Clear', no_match:'Nothing found', no_match_sub:'Try changing the filters',
  col_date:'Date', col_donor:'Donor', col_camp:'Campaign', col_method:'Method', col_amount:'Amount',
  receipt:'Receipt',
  f_donor:'Donor', f_donor_ph:'Type a name…', f_add_new:'Add “{q}” as a new donor', f_amount:'Amount', f_date:'Date', f_method:'Payment method',
  f_camp:'Campaign', f_none:'— General —', f_pledge:'Apply to pledge', f_no_pledge:'— None —', f_note:'Note', f_note_ph:'e.g. in honor of…, l’iluy nishmas…',
  save:'Save', cancel:'Cancel', edit_donation:'Edit donation', req:'This field is required', amt_req:'Enter an amount', bal:'{a} still owed',
  saved_don:'Donation saved', deleted:'Deleted', confirm_title:'Delete?', yes_del:'Yes, delete',
  confirm_del_don:'The {a} donation from {name} will be deleted.',
  confirm_del_donor:'{name} will be deleted, along with {n} donations and {p} pledges.',
  confirm_del_pl:'The pledge will be deleted. Payments already recorded stay.',
  confirm_del_camp:'The campaign will be deleted. Its donations become “General”.',
  f_name_yi:'Name in Yiddish', f_name_en:'Name in English', f_phone:'Phone', f_email:'Email', f_address:'Address', f_city:'City', f_notes:'Notes',
  edit_donor:'Edit donor', name_req:'Enter at least one name', saved_donor:'Donor saved',
  pl_sub:'{n} pledges · {a} outstanding',
  pl_open:'Open', pl_late:'Overdue', pl_paid:'Paid', pl_all:'All',
  col_pledged:'Pledged', col_paid:'Paid', col_balance:'Balance', col_due:'Due', col_progress:'Progress',
  record_pay:'Payment', f_due:'Due date', edit_pledge:'Edit pledge', saved_pledge:'Pledge saved',
  pledged_total:'Pledged', collected:'Collected', outstanding:'Outstanding', due_on:'Due {d}', paid_in_full:'Paid in full',
  camp_sub:'{n} campaigns', f_goal:'Goal', f_start:'Start', f_end:'End', saved_camp:'Campaign saved',
  donors_n:'Donors', gifts_n:'Gifts', avg_gift:'Average', view_donations:'View donations', edit_camp:'Edit campaign', f_camp_name_req:'Enter a name',
  set_org:'Organization', set_org_sub:'Printed on every receipt.', org_yi:'Name in Yiddish', org_en:'Name in English', org_addr:'Address', org_ein:'Tax ID (EIN)',
  org_phone:'Phone', org_email:'Email', signer:'Signed by', receipt_note:'Line at the bottom of receipts',
  set_saved:'Settings saved', set_data:'Data', set_data_sub:'Download everything as CSV — opens in Excel.', export_don:'Donations (CSV)', export_donors:'Donors (CSV)', export_pl:'Pledges (CSV)',
  reset:'Reset demo data', reset_desc:'Erases everything you added or changed and restores the sample data.', reset_done:'Demo data restored', reset_q:'All your changes will be lost.',
  demo_note:'This is a demo. All names, phone numbers and amounts are made up. Data is kept only in your browser.',
  language:'Language', about:'About',
  r_title:'Donation Receipt', r_no:'Receipt no.', r_from:'Received from', r_date:'Date', r_method:'Paid by', r_purpose:'Purpose', r_amount:'Amount',
  r_legal:'{org} is a 501(c)(3) nonprofit organization. No goods or services were provided in exchange for this contribution.',
  r_thanks:'Thank you for your generosity.', r_print:'Print / PDF', r_back:'Back', r_sign:'Authorized signature',
  r_stmt:'Annual Giving Statement', r_stmt_for:'Contributions in {y}', r_total_y:'Total {y}', r_general:'General fund', ein:'EIN',
  saved:'Saved', bsd:'בס״ד', r_preview:'Preview a receipt', r_pledge_pay:'pledge payment',
}};

/* ------------------------------------------------------------------ state */
let S = null;          // persisted data
let lang = 'yi';
const ui = { don:{q:'',period:'all',camp:'',method:''}, donors:{q:'',sort:'total'}, pl:{f:'open'} };

function t(k, v={}){ let s = (T[lang][k] ?? T.en[k] ?? k); for (const x in v) s = s.split('{'+x+'}').join(v[x]); return s; }
function save(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} }
function load(){
  try{ const raw = localStorage.getItem(KEY); if (raw){ S = JSON.parse(raw); } }catch(e){ S = null; }
  if (!S || !S.donors) { S = seed(); save(); }
  lang = S.settings.lang || 'yi';
}
const uid = p => p + Math.random().toString(36).slice(2,9);

/* ------------------------------------------------------------------ dates & numbers */
const pad = n => String(n).padStart(2,'0');
const iso = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const pd = s => new Date(s + 'T12:00:00');
const todayISO = () => iso(new Date());
const addDays = (s, n) => { const d = pd(s); d.setDate(d.getDate()+n); return iso(d); };
const daysBetween = (a, b) => Math.round((pd(b) - pd(a)) / 864e5);
const MON = {
  yi:['יאנואר','פעברואר','מערץ','אפריל','מאי','יוני','יולי','אויגוסט','סעפטעמבער','אקטאבער','נאוועמבער','דעצעמבער'],
  yis:['יאנ׳','פעב׳','מערץ','אפר׳','מאי','יוני','יולי','אויג׳','סעפ׳','אקט׳','נאוו׳','דעצ׳'],
  en:['January','February','March','April','May','June','July','August','September','October','November','December'],
  ens:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] };
function gdate(s, short){
  if (!s) return '';
  const d = pd(s), m = d.getMonth();
  if (lang === 'yi') return `${d.getDate()} ${(short?MON.yis:MON.yi)[m]} ${d.getFullYear()}`;
  return `${(short?MON.ens:MON.en)[m]} ${d.getDate()}, ${d.getFullYear()}`;
}
function gem(n){
  const ones=['','א','ב','ג','ד','ה','ו','ז','ח','ט'], tens=['','י','כ','ל','מ','נ','ס','ע','פ','צ'], hund=['','ק','ר','ש','ת','תק','תר','תש','תת','תתק'];
  let s = hund[Math.floor(n/100)] || ''; const r = n % 100;
  if (r === 15) s += 'טו'; else if (r === 16) s += 'טז'; else s += tens[Math.floor(r/10)] + ones[r%10];
  return s.length === 1 ? s + '׳' : s.slice(0,-1) + '״' + s.slice(-1);
}
let HF = null; try { HF = new Intl.DateTimeFormat('he-u-ca-hebrew', {day:'numeric', month:'long', year:'numeric'}); } catch(e){}
const hcache = {};
function hdate(s){
  if (!s || !HF) return '';
  if (hcache[s]) return hcache[s];
  try{
    const p = HF.formatToParts(pd(s)); const g = k => (p.find(x => x.type === k) || {}).value;
    let mo = g('month') || ''; mo = mo.replace('חשוון','חשון');
    const out = `${gem(+g('day'))} ${mo} ${gem(+g('year') % 1000)}`;
    return (hcache[s] = out);
  }catch(e){ return ''; }
}
const money = (n, cents) => '$' + Number(n||0).toLocaleString('en-US', {minimumFractionDigits: cents?2:0, maximumFractionDigits: cents?2:0});
const moneyAuto = n => money(n, Math.round(n) !== n);
const moneyShort = n => n >= 1e6 ? '$' + (n/1e6).toFixed(1).replace(/\.0$/,'') + 'M' : n >= 1e3 ? '$' + (n/1e3).toFixed(n >= 1e4 ? 0 : 1).replace(/\.0$/,'') + 'K' : '$' + Math.round(n);
const N = (n) => `<span class="num">${n}</span>`;

/* ------------------------------------------------------------------ demo data */
function seed(){
  let a = 20261116;
  const rnd = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let x = Math.imul(a ^ a >>> 15, 1 | a); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; };
  const pick = arr => arr[Math.floor(rnd() * arr.length)];
  const ri = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));
  const today = todayISO();
  const cities = [
    ['Kiryas Joel, NY','קרית יואל',['Forest Rd','Acres Rd','Raywood Dr','Hayes Ct']],
    ['Monroe, NY','מאנרא',['Mountain Rd','Seven Springs Rd','Larkin Dr']],
    ['Brooklyn, NY','וויליאמסבורג',['Lee Ave','Bedford Ave','Rutledge St','Hooper St']],
    ['Brooklyn, NY','בארא פארק',['14th Ave','48th St','53rd St','16th Ave']],
    ['Monsey, NY','מאנסי',['Maple Ave','Phyllis Terrace','Carlton Rd']],
    ['Lakewood, NJ','לייקוואוד',['Princeton Ave','Forest Ave','Madison Ave']]];
  const cityEn = {'וויליאמסבורג':'Williamsburg','בארא פארק':'Boro Park'};
  const names = [
    ['Yoel Friedman','יואל פריעדמאן'],['Moshe Weiss','משה ווייס'],['Chaim Klein','חיים קליין'],['Yisroel Rosenberg','ישראל ראזענבערג'],
    ['Avrohom Schwartz','אברהם שווארץ'],['Shloime Goldberger','שלמה גאלדבערגער'],['Mordche Teitelbaum','מרדכי טייטלבוים'],['Duvid Hershkowitz','דוד הערשקאוויטש'],
    ['Yakov Stern','יעקב שטערן'],['Mendel Grunwald','מענדל גרונוואלד'],['Zalmen Lefkowitz','זלמן לעפקאוויטש'],['Berish Fischer','בעריש פישער'],
    ['Aron Landau','אהרן לאנדוי'],['Shmiel Brach','שמואל בראך'],['Lipa Neuberger','ליפא נויבערגער'],['Hershel Gross','הערשל גראס'],
    ['Yidel Rubin','אידל רובין'],['Pinchus Kohn','פנחס קאהן'],['Naftali Berkowitz','נפתלי בערקאוויטש'],['Eliezer Deutsch','אליעזר דייטש'],
    ['Shulem Spitzer','שלום שפיצער'],['Itzik Wieder','איציק ווידער'],['Getzel Halberstam','געצל האלבערשטאם'],['Burech Mermelstein','ברוך מערמלשטיין'],
    ['Leibish Strulowitz','לייביש סטרולאוויטש'],['Kalmen Zupnick','קלמן זופניק'],['Feivel Gluck','פייוול גליק'],['Yossel Katz','יאסל כ״ץ'],
    ['Simcha Bunim Ehrenreich','שמחה בונם עהרענרייך'],['Nachman Paskesz','נחמן פאסקעס'],['Meilech Hoffman','מיילעך האפמאן'],['Sender Jacobowitz','סענדער יאקאבאוויטש'],
    ['Avrum Mayer Kahan','אברהם מאיר כהן'],['Tuli Rottenberg','טולי ראטנבערג'],['Hillel Weinberger','הלל ווינבערגער'],['Usher Leifer','אשר לייפער'],
    ['Yechiel Mandel','יחיאל מאנדל'],['Sruly Herzog','שרולי הערצאג'],['Chaskel Moskowitz','חזקאל מאסקאוויטש'],['Eli Brunner','אלי ברונער'],
    ['Mrs. Rivka Gelbman','מרת רבקה געלבמאן'],['Mrs. Chaya Sara Reich','מרת חיה שרה רייך'],['Mrs. Malky Steinmetz','מרת מלכי שטיינמעץ'],
    ['Wolf Ungar','וואלף אונגאר'],['Shaya Breuer','ישעיה ברויער'],['Motty Lowy','מאטי לעווי'],['Yanky Schlesinger','יענקי שלעזינגער'],
    ['Hilltop Glass & Mirror Inc.','הילטאפ גלאס און מירער'],['Sunrise Bakery','סאנרייז בעקערי'],['Lev Tov Family Fund','לב טוב פאמיליע פאנד']];
  const donors = names.map((n, i) => {
    const c = cities[i % cities.length], first = n[0].replace(/^Mrs\. /,'').split(' ')[0].toLowerCase();
    const biz = i >= names.length - 3;
    return { id:'d'+(i+1), nameEn:n[0], nameYi:n[1],
      phone:`(${pick(['845','718','347','732','845'])}) 555-01${pad(ri(0,99))}`,
      email: biz ? `office@${first}.example.com` : `${first}.${n[0].split(' ').pop().toLowerCase().replace(/[^a-z]/g,'')}@example.com`,
      address:`${ri(2,480)} ${pick(c[2])}`, city:(cityEn[c[1]] ? cityEn[c[1]] + ', NY' : c[0]), cityYi:c[1],
      notes: '', created:'', tier: biz || i % 9 === 0 ? 3 : i % 3 === 0 ? 2 : 1 };
  });
  donors[1].notes = 'Prefers receipts by email.\nיארצייט: כ״ג שבט';
  donors[4].notes = 'Monthly Zelle on the 1st.';
  donors[47].notes = 'Matching gift from the company — check with the office.';

  const campaigns = [
    {id:'c1', nameYi:'חנוכה קאמפעין תשפ״ז', nameEn:'Chanukah Campaign 5787', goal:75000, start:'2026-11-01', end:'2026-12-14'},
    {id:'c2', nameYi:'בנין פאנד — נייע הכנסת אורחים', nameEn:'Building Fund — New Hachnosas Orchim', goal:250000, start:'2025-09-01', end:'2027-06-30'},
    {id:'c3', nameYi:'ימים נוראים תשפ״ז', nameEn:'Yomim Noraim 5787', goal:50000, start:'2026-08-16', end:'2026-10-04'},
    {id:'c4', nameYi:'קמחא דפסחא תשפ״ו', nameEn:'Kimcha d’Pischa 5786', goal:120000, start:'2026-02-15', end:'2026-04-01'},
    {id:'c5', nameYi:'מתנות לאביונים — פורים תשפ״ו', nameEn:'Matanos L’evyonim — Purim 5786', goal:40000, start:'2026-02-05', end:'2026-03-03'},
  ];
  const start = addDays(today, -440);
  const windows = campaigns.filter(c => c.id !== 'c2' && c.start <= today);
  const amounts = {1:[18,18,36,36,52,54,72,100,100,180,180,250], 2:[180,250,360,360,500,500,720,1000,1000,1800], 3:[1000,1800,1800,2500,3600,5000,5000,10000,18000]};
  const methods = ['check','check','check','zelle','zelle','card','card','cash','cash','zelle'];
  const donations = [];
  const mk = (donorId, date, amount, campaignId, extra={}) => {
    const method = extra.method || (amount >= 3600 ? pick(['check','check','zelle']) : pick(methods));
    donations.push({ id:uid('n'), donorId, date, amount, method, checkNo: method === 'check' ? String(ri(1020, 9890)) : '', campaignId, note: extra.note || '', pledgeId: extra.pledgeId || '' });
  };
  donors.forEach(d => {
    const n = d.tier === 3 ? ri(4,9) : d.tier === 2 ? ri(5,11) : ri(3,9);
    for (let k = 0; k < n; k++){
      let date, camp = '';
      if (rnd() < 0.5){ const w = pick(windows); const end = w.end < today ? w.end : today; date = addDays(w.start, ri(0, Math.max(0, daysBetween(w.start, end)))); camp = w.id; }
      else { date = addDays(start, ri(0, daysBetween(start, today))); camp = rnd() < 0.25 ? 'c2' : ''; }
      mk(d.id, date, pick(amounts[d.tier]), camp);
    }
  });
  // a few monthly regulars
  [5, 12, 30].forEach(i => { for (let m = 13; m >= 0; m--){ const dd = new Date(); dd.setDate(1); dd.setMonth(dd.getMonth() - m); const s = iso(dd); if (s >= start && s <= today) mk('d'+i, s, i === 5 ? 180 : 100, '', {method: i === 5 ? 'zelle' : 'card', note: lang === 'yi' ? '' : ''}); } });
  // notes on some gifts
  const noteList = ['לזכות רפואה שלימה','לעילוי נשמת אביו ז״ל','In honor of the new baby','For Yom Kippur appeal','לזכות הצלחה','In memory of his mother'];
  for (let k = 0; k < 14; k++) pick(donations).note = pick(noteList);

  // pledges with installments
  const pledges = [];
  const plSpec = [
    ['d1','c2',36000,'2025-10-12','2027-06-30',[3000,3000,3000,3000,3000,3000,3000]],
    ['d10','c2',18000,'2025-11-02','2027-01-31',[1500,1500,1500,1500,1500,1500,1500,1500,1500,1500]],
    ['d19','c2',25000,'2026-01-20','2027-06-30',[5000,5000]],
    ['d28','c2',10000,'2025-12-08','2026-09-30',[2500,2500,2500]],
    ['d48','c2',50000,'2026-03-15','2027-03-31',[10000,10000,10000]],
    ['d49','c1',10000,'2026-11-03','2026-12-14',[5000]],
    ['d4','c1',3600,'2026-11-05','2026-12-14',[]],
    ['d13','c1',5000,'2026-11-08','2026-12-14',[1800]],
    ['d22','c1',1800,'2026-11-10','2026-12-14',[]],
    ['d37','c4',5000,'2026-02-20','2026-03-31',[2500,2500]],
    ['d46','c4',3600,'2026-02-24','2026-03-31',[1800]],
    ['d7','c3',2600,'2026-08-25','2026-10-01',[2600]],
    ['d16','c3',1800,'2026-09-01','2026-10-01',[900]],
    ['d50','c2',15000,'2026-06-10','2027-06-30',[3000,3000]],
  ];
  plSpec.forEach(([donorId, campaignId, amount, date, due, pays], i) => {
    const id = 'p' + (i+1);
    pledges.push({ id, donorId, campaignId, amount, date, due, note:'' });
    const span = Math.max(1, daysBetween(date, due < today ? due : today));
    pays.forEach((amt, j) => {
      let pdate = addDays(date, Math.round(span * (j + 0.5) / Math.max(pays.length, 1)));
      if (pdate > today) pdate = today;
      mk(donorId, pdate, amt, campaignId, {pledgeId:id, method: amt >= 5000 ? 'check' : pick(['check','zelle','card'])});
    });
  });
  pledges[0].note = 'Dedication: dining room plaque.';
  // goals set so progress looks like a real year: running, finished, just over / under
  const target = {c1:0.46, c2:0.52, c3:1.08, c4:1.04, c5:0.93};
  campaigns.forEach(c => { const raised = donations.filter(d => d.campaignId === c.id).reduce((s, d) => s + d.amount, 0); const g = raised / target[c.id]; c.goal = Math.max(5000, g > 60000 ? Math.round(g / 5000) * 5000 : Math.round(g / 1000) * 1000); });
  donations.sort((x, y) => x.date < y.date ? -1 : x.date > y.date ? 1 : 0);
  const seq = {}; donations.forEach(d => { const y = d.date.slice(0,4); seq[y] = (seq[y]||0) + 1; d.receiptNo = `${y}-${String(seq[y]).padStart(4,'0')}`; });
  donors.forEach(d => { const first = donations.find(x => x.donorId === d.id); d.created = first ? first.date : start; delete d.tier; });
  return {
    v:1, seq,
    settings:{ lang:'yi', orgYi:'קרן עזרת אחים', orgEn:'Keren Ezras Achim, Inc.', address:'100 Sample Street, Suite 2\nMonroe, NY 10950',
      ein:'12-3456789', phone:'(845) 555-0100', email:'office@example.org', signer:'Y. Weiss, Treasurer', receiptNote:'' },
    donors, donations, pledges, campaigns };
}

/* ------------------------------------------------------------------ lookups */
const donorById = id => S.donors.find(d => d.id === id);
const campById = id => S.campaigns.find(c => c.id === id);
const pledgeById = id => S.pledges.find(p => p.id === id);
const dname = d => !d ? '—' : (lang === 'yi' ? (d.nameYi || d.nameEn) : (d.nameEn || d.nameYi));
const dalt = d => !d ? '' : (lang === 'yi' ? (d.nameYi && d.nameEn ? d.nameEn : '') : (d.nameEn && d.nameYi ? d.nameYi : ''));
const dcity = d => !d ? '' : (lang === 'yi' ? (d.cityYi || d.city || '') : (d.city || d.cityYi || ''));
const cname = c => !c ? t('r_general') : (lang === 'yi' ? (c.nameYi || c.nameEn) : (c.nameEn || c.nameYi));
const orgName = () => lang === 'yi' ? (S.settings.orgYi || S.settings.orgEn) : (S.settings.orgEn || S.settings.orgYi);
const initials = d => { const n = dname(d).replace(/^(Mrs\.|מרת)\s+/,''); const p = n.split(/\s+/).filter(Boolean); return lang === 'yi' ? (p[0]||'')[0] + ((p[1]||'')[0]||'') : ((p[0]||'')[0] + ((p[p.length-1]||'')[0] || '')).toUpperCase(); };
const sum = arr => arr.reduce((s, x) => s + (+x.amount || 0), 0);
const paidOn = p => sum(S.donations.filter(d => d.pledgeId === p.id));
function pledgeStatus(p){ const bal = p.amount - paidOn(p); if (bal <= 0) return 'paid'; if (p.due && p.due < todayISO()) return 'late'; return 'open'; }
const methodBadge = (m, checkNo) => `<span class="badge m-${m}">${esc(t('m_'+m))}${m === 'check' && checkNo ? ' ' + N(esc(t('check_short',{n:checkNo}))) : ''}</span>`;
function avatar(d, gold){ return `<div class="avatar ${gold?'g':''}">${esc(initials(d))}</div>`; }
function dateCell(s){ return lang === 'yi' ? `<div>${esc(hdate(s))}</div><div class="hdate">${esc(gdate(s, true))}</div>` : `<div>${esc(gdate(s, true))}</div><div class="hdate"><bdi>${esc(hdate(s))}</bdi></div>`; }
function bothDates(s){ return lang === 'yi' ? `${esc(hdate(s))} · ${esc(gdate(s))}` : `${esc(gdate(s))} · <span dir="rtl">${esc(hdate(s))}</span>`; }

/* ------------------------------------------------------------------ router */
function route(){
  const h = location.hash.replace(/^#\/?/, '') || 'dash';
  const [path, qs] = h.split('?');
  const parts = path.split('/');
  const q = {}; (qs||'').split('&').filter(Boolean).forEach(kv => { const [k, v] = kv.split('='); q[k] = decodeURIComponent(v||''); });
  return { page: parts[0] || 'dash', id: parts[1], id2: parts[2], q };
}
function go(h){ location.hash = h; }

function render(){
  document.documentElement.lang = lang === 'yi' ? 'yi' : 'en';
  document.documentElement.dir = lang === 'yi' ? 'rtl' : 'ltr';
  const r = route();
  let body = '', nav = r.page;
  try{
    switch (r.page){
      case 'donors': body = pDonors(r); break;
      case 'donor': body = pDonor(r); nav = 'donors'; break;
      case 'donations': body = pDonations(r); break;
      case 'pledges': body = pPledges(r); break;
      case 'campaigns': body = pCampaigns(r); break;
      case 'settings': body = pSettings(r); break;
      case 'receipt': body = pReceipt(r); nav = 'donations'; break;
      case 'statement': body = pStatement(r); nav = 'donors'; break;
      default: body = pDash(r); nav = 'dash';
    }
  }catch(e){ console.error(e); body = `<div class="card empty-state"><b>${esc(t('no_match'))}</b><a href="#/">${esc(t('nav_dash'))}</a></div>`; }
  document.body.dataset.page = r.page;
  $('#app').innerHTML = shell(nav, body);
  document.title = `${t('appName')} · ${t('nav_' + (nav === 'dash' ? 'dash' : nav === 'campaigns' ? 'camps' : nav))} — ${t('demo')}`;
  after(r);
}

function shell(nav, body){
  const items = [['dash','#/','dash','nav_dash'],['donors','#/donors','users','nav_donors'],['donations','#/donations','money','nav_donations'],['pledges','#/pledges','pledge','nav_pledges'],['campaigns','#/campaigns','target','nav_camps']];
  const openPl = S.pledges.filter(p => pledgeStatus(p) !== 'paid').length;
  const counts = {donors:S.donors.length, donations:S.donations.length, pledges:openPl, campaigns:S.campaigns.length};
  return `<div class="shell">
  <aside class="side">
    <a class="logo" href="#/"><div class="logo-mark">פ</div><div><div class="logo-name">${esc(t('appName'))}</div><div class="logo-sub">${esc(t('appSub'))}</div></div></a>
    <nav class="nav">
      ${items.map(([k, h, ic, l]) => `<a href="${h}" class="${nav===k?'on':''}">${icon(ic)}<span>${esc(t(l))}</span>${counts[k] != null ? `<span class="count">${counts[k]}</span>` : ''}</a>`).join('')}
      <a href="#/settings" class="${nav==='settings'?'on':''}">${icon('settings')}<span>${esc(t('nav_settings'))}</span></a>
    </nav>
    <div class="side-foot"><div class="org">${esc(orgName())}</div><span class="demo-pill">${esc(t('demo'))}</span></div>
  </aside>
  <div class="main">
    <header class="top">
      <a class="m-logo" href="#/"><span class="logo-mark">פ</span>${esc(t('appName'))} <span class="demo-pill">${esc(t('demo'))}</span></a>
      <div class="search" id="gsearch">${icon('search')}<input id="gq" type="search" autocomplete="off" placeholder="${esc(t('search_ph'))}" aria-label="${esc(t('search_ph'))}"><div class="search-pop" id="gpop" hidden></div></div>
      <div class="top-actions">
        <button class="icon-btn search-toggle" data-act="search-toggle" aria-label="search">${icon('search')}</button>
        <div class="lang" role="group" aria-label="Language"><button data-act="lang" data-v="yi" class="${lang==='yi'?'on':''}">אידיש</button><button data-act="lang" data-v="en" class="${lang==='en'?'on':''}">English</button></div>
        <a class="icon-btn m-only" href="#/settings" aria-label="${esc(t('nav_settings'))}">${icon('settings')}</a>
        <button class="btn primary add-top" data-act="add-donation">${icon('plus')}${esc(t('new_donation'))}</button>
      </div>
    </header>
    <main class="content">${body}</main>
  </div>
  <nav class="tabbar">${items.map(([k, h, ic, l]) => `<a href="${h}" class="${nav===k?'on':''}">${icon(ic)}<span>${esc(t(l))}</span></a>`).join('')}</nav>
  <button class="fab" data-act="add-donation" aria-label="${esc(t('new_donation'))}">${icon('plus')}</button>
</div>`;
}

/* ------------------------------------------------------------------ dashboard */
function monthKey(s){ return s.slice(0,7); }
function pDash(){
  const today = todayISO(), y = today.slice(0,4), mk = monthKey(today);
  const lm = new Date(pd(today)); lm.setDate(1); lm.setMonth(lm.getMonth()-1); const lmk = iso(lm).slice(0,7);
  const dayOfMonth = +today.slice(8,10);
  const thisM = S.donations.filter(d => monthKey(d.date) === mk);
  const lastMSame = S.donations.filter(d => monthKey(d.date) === lmk && +d.date.slice(8,10) <= dayOfMonth);
  const thisY = S.donations.filter(d => d.date.slice(0,4) === y && d.date <= today);
  const mT = sum(thisM), lT = sum(lastMSame), yT = sum(thisY);
  const delta = lT ? Math.round((mT - lT) / lT * 100) : 0;
  const donorsY = new Set(thisY.map(d => d.donorId));
  const newDonors = S.donors.filter(d => d.created && d.created.slice(0,4) === y).length;
  const open = S.pledges.filter(p => pledgeStatus(p) !== 'paid');
  const owed = open.reduce((s, p) => s + Math.max(0, p.amount - paidOn(p)), 0);

  const recent = S.donations.filter(d => d.date <= today).slice().sort((a,b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)).slice(0, 7);
  const camps = S.campaigns.slice().filter(c => c.end >= addDays(today, -60)).sort((a,b) => (a.end < today) - (b.end < today) || a.end.localeCompare(b.end)).slice(0, 4);

  const byM = {}; thisY.forEach(d => byM[d.method] = (byM[d.method]||0) + d.amount);
  const mMax = Math.max(1, ...Object.values(byM));
  const top = {}; thisY.forEach(d => top[d.donorId] = (top[d.donorId]||0) + d.amount);
  const topL = Object.entries(top).sort((a,b) => b[1]-a[1]).slice(0,5);

  return `
  <div class="page-head">
    <div><h1>${esc(t('nav_dash'))}</h1><div class="sub">${esc(t('today'))}: ${bothDates(today)}</div></div>
  </div>
  <div class="kpis">
    <div class="card kpi hero"><div class="lbl">${icon('coins')}${esc(t('k_month'))}</div><div class="val num">${money(mT)}</div>
      <div class="foot">${lT ? `<span class="delta ${delta>=0?'up':'down'} num">${delta>=0?'+':''}${delta}%</span> ${esc(t('vs_last'))}` : ''} · ${esc(t('gifts',{n:thisM.length}))}</div></div>
    <div class="card kpi"><div class="lbl">${icon('cal')}${esc(t('k_year',{y}))}</div><div class="val num">${money(yT)}</div><div class="foot">${esc(t('gifts',{n:thisY.length}))}</div></div>
    <div class="card kpi"><div class="lbl">${icon('users')}${esc(t('k_donors'))}</div><div class="val num">${donorsY.size}</div><div class="foot">${esc(t('new_donors',{n:newDonors}))}</div></div>
    <a class="card kpi" href="#/pledges" style="color:inherit"><div class="lbl">${icon('pledge')}${esc(t('k_pledges'))}</div><div class="val num">${money(owed)}</div><div class="foot">${esc(t('to_collect'))} · ${esc(t('from_n',{n:open.length}))}</div></a>
  </div>
  <div class="dash">
    <div class="grid">
      <section class="card">
        <div class="card-h"><div><h2>${esc(t('chart_title'))}</h2><div class="muted" style="font-size:13px">${esc(t('chart_sub'))}</div></div></div>
        <div class="card-b"><div class="chart" id="mchart"></div></div>
      </section>
      <section class="card">
        <div class="card-h"><h2>${esc(t('recent'))}</h2><a class="link-btn" href="#/donations">${esc(t('see_all'))}</a></div>
        <div class="rows" style="margin-top:8px">${recent.map(d => { const dn = donorById(d.donorId); return `
          <a class="row" href="#/receipt/${d.id}" style="grid-template-columns:1fr auto">
            <div class="who">${avatar(dn)}<div><div class="name">${esc(dname(dn))}</div><div class="meta">${esc(lang==='yi'?hdate(d.date):gdate(d.date,true))} · ${esc(cname(campById(d.campaignId)))}</div></div></div>
            <div style="text-align:end"><div class="amt num">${moneyAuto(d.amount)}</div><div style="margin-top:2px">${methodBadge(d.method)}</div></div>
          </a>`; }).join('')}</div>
      </section>
    </div>
    <div class="grid" style="align-content:start">
      <section class="card">
        <div class="card-h"><h2>${esc(t('camps_title'))}</h2><a class="link-btn" href="#/campaigns">${esc(t('see_all'))}</a></div>
        <div style="margin-top:8px">${camps.map(campRow).join('')}</div>
      </section>
      <section class="card">
        <div class="card-h"><h2>${esc(t('by_method'))}</h2><span class="muted" style="font-size:13px">${esc(y)}</span></div>
        <div class="card-b">${['check','zelle','card','cash'].map(m => `
          <div class="method-row"><div style="font-size:14px">${esc(t('m_'+m))}</div><div class="prog"><span style="width:${((byM[m]||0)/mMax*100).toFixed(1)}%"></span></div><div class="num" style="text-align:end;font-weight:500;font-size:14px">${money(byM[m]||0)}</div></div>`).join('')}
        </div>
      </section>
      <section class="card">
        <div class="card-h"><h2>${esc(t('top_donors'))}</h2></div>
        <div class="rows" style="margin-top:8px">${topL.map(([id, amt], i) => { const dn = donorById(id); return `
          <a class="row" href="#/donor/${id}" style="grid-template-columns:1fr auto"><div class="who">${avatar(dn, i===0)}<div class="name">${esc(dname(dn))}</div></div><div class="amt num">${money(amt)}</div></a>`; }).join('')}</div>
      </section>
    </div>
  </div>`;
}
function campRaised(c){ return sum(S.donations.filter(d => d.campaignId === c.id)); }
function campWhen(c){
  const today = todayISO();
  if (c.start > today) return t('starts_in',{n:daysBetween(today, c.start)});
  if (!c.end) return t('ongoing');
  if (c.end < today) return t('ended');
  return t('days_left',{n:daysBetween(today, c.end)});
}
function campRow(c){
  const r = campRaised(c), pct = c.goal ? Math.min(100, r / c.goal * 100) : 0;
  return `<a class="camp" href="#/donations?campaign=${c.id}">
    <div class="camp-top"><span class="name">${esc(cname(c))}</span><span class="num" style="font-weight:600">${c.goal ? Math.round(r / c.goal * 100) + '%' : ''}</span></div>
    ${c.goal ? `<div class="prog ${r>=c.goal?'done':(c.id==='c1'?'gold':'')}"><span style="width:${pct.toFixed(1)}%"></span></div>` : ''}
    <div class="camp-foot"><span>${N(money(r))} ${c.goal ? esc(t('of')) + ' ' + N(money(c.goal)) : ''}</span><span>${esc(campWhen(c))}</span></div>
  </a>`;
}

function drawChart(el){
  const today = todayISO(), months = [];
  const d0 = pd(today); d0.setDate(1);
  for (let i = 11; i >= 0; i--){ const d = new Date(d0); d.setMonth(d.getMonth() - i); months.push({k: iso(d).slice(0,7), m: d.getMonth(), y: d.getFullYear(), v: 0, n: 0}); }
  const idx = {}; months.forEach((m, i) => idx[m.k] = i);
  S.donations.forEach(d => { const i = idx[monthKey(d.date)]; if (i != null && d.date <= today){ months[i].v += d.amount; months[i].n++; } });
  const W = Math.max(300, Math.round(el.clientWidth || 640)), H = W < 520 ? 210 : 240, padT = 24, padB = 28, padS = W < 520 ? 38 : 48;
  const max = Math.max(1, ...months.map(m => m.v));
  const stepRaw = max / 3, mag = Math.pow(10, Math.floor(Math.log10(stepRaw))); const step = Math.ceil(stepRaw / mag) * mag; const top = step * 3;
  const rtl = lang === 'yi', plotW = W - padS, bw = plotW / 12, gap = Math.max(6, bw * 0.28);
  const xOf = i => rtl ? (W - padS) - (i + 1) * bw : padS + i * bw;
  const yOf = v => padT + (H - padT - padB) * (1 - v / top);
  let s = `<svg viewBox="0 0 ${W} ${H}" style="direction:ltr" role="img" aria-label="${esc(t('chart_title'))}">`;
  for (let g = 0; g <= 3; g++){ const v = step * g, yy = yOf(v); s += `<line class="grid-l" x1="${rtl?0:padS}" x2="${rtl?W-padS:W}" y1="${yy}" y2="${yy}"/><text x="${rtl? W - padS + 8 : padS - 8}" y="${yy + 4}" text-anchor="${rtl?'start':'end'}">${moneyShort(v)}</text>`; }
  const maxI = months.reduce((b, m, i) => m.v > months[b].v ? i : b, 0);
  months.forEach((m, i) => {
    const x = xOf(i) + gap / 2, w = bw - gap, y = yOf(m.v), h = Math.max(0, H - padB - y), r = Math.min(4, w / 2, h);
    const cur = i === 11;
    if (h > 0) s += `<path class="bar ${cur?'cur':''}" data-i="${i}" d="M${x},${H-padB} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${H-padB} Z"/>`;
    if (bw >= 34 || (11 - i) % 2 === 0) s += `<text x="${x + w/2}" y="${H - 8}" text-anchor="middle" ${cur?'style="fill:var(--ink);font-weight:600"':''}>${esc((lang==='yi'?MON.yis:MON.ens)[m.m])}</text>`;
    if (cur || i === maxI) s += `<text x="${x + w/2}" y="${y - 7}" text-anchor="middle" style="fill:var(--ink-2);font-weight:600">${moneyShort(m.v)}</text>`;
    s += `<rect class="hit" data-i="${i}" x="${xOf(i)}" y="${padT - 10}" width="${bw}" height="${H - padT - padB + 10}"/>`;
  });
  s += `</svg><div class="tip" hidden></div>`;
  el.innerHTML = s;
  const tip = $('.tip', el), svg = $('svg', el);
  const show = i => {
    const m = months[i]; el.classList.add('hovering');
    $$('.bar', el).forEach(b => b.classList.toggle('hv', +b.dataset.i === +i));
    tip.innerHTML = `<span class="muted">${esc((lang==='yi'?MON.yi:MON.en)[m.m])} ${m.y}</span><b class="num">${money(m.v)}</b><span class="muted">${esc(t('gifts',{n:m.n}))}</span>`;
    const sc = svg.getBoundingClientRect().width / W;
    let left = (xOf(i) + bw / 2) * sc; const ww = el.clientWidth;
    left = Math.max(70, Math.min(ww - 70, left));
    tip.style.left = left + 'px'; tip.style.top = (Math.max(yOf(m.v), padT + 40) * sc - 8) + 'px'; tip.hidden = false;
  };
  const hide = () => { el.classList.remove('hovering'); tip.hidden = true; };
  $$('.hit', el).forEach(h => { h.addEventListener('mouseenter', () => show(h.dataset.i)); h.addEventListener('click', () => show(h.dataset.i)); });
  el.addEventListener('mouseleave', hide);
}

/* ------------------------------------------------------------------ donors */
function donorStats(){
  const st = {}; const y = todayISO().slice(0,4);
  S.donors.forEach(d => st[d.id] = {total:0, n:0, last:'', year:0});
  S.donations.forEach(x => { const s = st[x.donorId]; if (!s) return; s.total += x.amount; s.n++; if (x.date > s.last) s.last = x.date; if (x.date.slice(0,4) === y) s.year += x.amount; });
  return st;
}
const norm = s => String(s||'').toLowerCase().replace(/[״"'׳\-().\s]/g, '');
function donorMatch(d, q){ if (!q) return true; const n = norm(q); return [d.nameEn, d.nameYi, d.phone, d.email, d.city, d.cityYi, d.address].some(v => norm(v).includes(n)); }
function pDonors(r){
  if (r.q.q != null) ui.donors.q = r.q.q;
  const st = donorStats(); const yT = Object.values(st).reduce((s, x) => s + x.year, 0);
  return `
  <div class="page-head">
    <div><h1>${esc(t('nav_donors'))}</h1><div class="sub">${t('donors_sub',{n:N(S.donors.length), a:N(money(yT))})}</div></div>
    <div class="actions"><button class="btn hide-m" data-act="export-donors">${icon('download')}${esc(t('export'))}</button><button class="btn primary" data-act="add-donor">${icon('plus')}<span>${esc(t('new_donor'))}</span></button></div>
  </div>
  <section class="card t-donor">
    <div class="toolbar">
      <div class="search">${icon('search')}<input id="dq" type="search" value="${esc(ui.donors.q)}" placeholder="${esc(t('search_ph'))}"></div>
      <select class="select" id="dsort">${['total','recent','name'].map(k => `<option value="${k}" ${ui.donors.sort===k?'selected':''}>${esc(t('sort_'+k))}</option>`).join('')}</select>
    </div>
    <div class="thead"><div>${esc(t('col_name'))}</div><div>${esc(t('col_city'))}</div><div>${esc(t('col_phone'))}</div><div>${esc(t('col_last'))}</div><div class="r">${esc(t('col_count'))}</div><div class="r">${esc(t('col_total'))}</div></div>
    <div class="rows" id="dlist"></div>
  </section>`;
}
function fillDonors(){
  const el = $('#dlist'); if (!el) return;
  const st = donorStats();
  let list = S.donors.filter(d => donorMatch(d, ui.donors.q));
  const s = ui.donors.sort;
  list.sort((a, b) => s === 'name' ? dname(a).localeCompare(dname(b), lang === 'yi' ? 'he' : 'en') : s === 'recent' ? (st[b.id].last||'').localeCompare(st[a.id].last||'') : st[b.id].total - st[a.id].total);
  el.innerHTML = list.length ? list.map(d => { const x = st[d.id]; return `
    <a class="row" href="#/donor/${d.id}">
      <div class="who">${avatar(d)}<div><div class="name">${esc(dname(d))}</div><div class="meta" dir="auto" style="text-align:start">${esc(dalt(d) || dcity(d))}</div></div></div>
      <div class="c-hide meta">${esc(dcity(d))}</div>
      <div class="c-hide meta num">${esc(d.phone)}</div>
      <div class="c-hide meta">${x.last ? esc(gdate(x.last, true)) : '—'}</div>
      <div class="c-hide r num">${x.n}</div>
      <div class="amt num">${money(x.total)}<div class="meta m-only" style="font-weight:400">${esc(t('gifts',{n:x.n}))}</div></div>
    </a>`; }).join('') : `<div class="empty-state"><b>${esc(t('search_none'))}</b>${esc(t('no_match_sub'))}</div>`;
}

function pDonor(r){
  const d = donorById(r.id);
  if (!d) return `<div class="card empty-state"><b>${esc(t('search_none'))}</b><a href="#/donors">${esc(t('back_donors'))}</a></div>`;
  const today = todayISO(), y = today.slice(0,4);
  const list = S.donations.filter(x => x.donorId === d.id).sort((a,b) => b.date.localeCompare(a.date));
  const pls = S.pledges.filter(p => p.donorId === d.id);
  const owed = pls.reduce((s, p) => s + Math.max(0, p.amount - paidOn(p)), 0);
  const years = [...new Set(list.map(x => x.date.slice(0,4)))].sort().reverse();
  const stYear = years.includes(y) ? y : (years[0] || y);
  return `
  <a class="crumb" href="#/donors">${icon('back','flip')}${esc(t('back_donors'))}</a>
  <section class="card">
    <div class="profile">
      <div class="avatar lg">${esc(initials(d))}</div>
      <div style="flex:1;min-width:0">
        <h1>${esc(dname(d))}</h1>${dalt(d) ? `<div class="alt">${esc(dalt(d))}</div>` : ''}
        <div class="contact">
          ${d.phone ? `<span>${icon('phone')}<a class="num" href="tel:${esc(d.phone.replace(/[^0-9+]/g,''))}">${esc(d.phone)}</a></span>` : ''}
          ${d.email ? `<span>${icon('mail')}<a href="mailto:${esc(d.email)}">${esc(d.email)}</a></span>` : ''}
          ${(d.address || dcity(d)) ? `<span>${icon('pin')}${d.address ? `<bdi dir="ltr">${esc(d.address)}</bdi>${dcity(d) ? ', ' : ''}` : ''}${esc(dcity(d))}</span>` : ''}
        </div>
      </div>
    </div>
    <div class="stats4">
      <div><div class="l">${esc(t('lifetime'))}</div><div class="v num">${money(sum(list))}</div></div>
      <div><div class="l">${esc(t('this_year'))}</div><div class="v num">${money(sum(list.filter(x => x.date.slice(0,4) === y)))}</div></div>
      <div><div class="l">${esc(t('gift_count'))}</div><div class="v num">${list.length}</div></div>
      <div><div class="l">${esc(t('open_balance'))}</div><div class="v num" style="${owed?'color:var(--warn)':''}">${money(owed)}</div></div>
    </div>
  </section>
  <div class="page-head" style="margin:16px 0 0">
    <div class="actions">
      <button class="btn primary" data-act="add-donation" data-donor="${d.id}">${icon('plus')}${esc(t('new_donation'))}</button>
      <button class="btn" data-act="add-pledge" data-donor="${d.id}">${icon('pledge')}${esc(t('new_pledge'))}</button>
      ${list.length ? `<a class="btn" href="#/statement/${d.id}/${stYear}">${icon('file')}${esc(t('statement',{y:stYear}))}</a>` : ''}
      <button class="btn" data-act="edit-donor" data-id="${d.id}">${icon('pencil')}${esc(t('edit'))}</button>
    </div>
  </div>
  <div class="two">
    <section class="card t-hist">
      <div class="card-h" style="padding-bottom:12px"><h2>${esc(t('history'))}</h2><span class="muted num">${list.length}</span></div>
      <div class="rows" style="border-top:1px solid var(--line)">${list.length ? list.map(x => donRow(x, true)).join('') : `<div class="empty-state">${esc(t('no_donations'))}</div>`}</div>
    </section>
    <div class="grid" style="align-content:start">
      <section class="card">
        <div class="card-h"><h2>${esc(t('pledges'))}</h2></div>
        <div style="margin-top:8px">${pls.length ? pls.map(p => { const paid = paidOn(p), st = pledgeStatus(p); return `
          <div class="camp"><div class="camp-top"><span class="name">${esc(cname(campById(p.campaignId)))}</span>${statusBadge(st)}</div>
          <div class="prog ${st==='paid'?'done':''}"><span style="width:${Math.min(100, paid/p.amount*100).toFixed(1)}%"></span></div>
          <div class="camp-foot"><span>${N(money(paid))} ${esc(t('of'))} ${N(money(p.amount))}</span>${st!=='paid' ? `<button class="link-btn" data-act="pay-pledge" data-id="${p.id}">${esc(t('record_pay'))}</button>` : ''}</div></div>`; }).join('') : `<div class="empty-state" style="padding:24px">${esc(t('no_pledges'))}</div>`}</div>
      </section>
      ${d.notes ? `<section class="card"><div class="card-h"><h2>${esc(t('notes'))}</h2></div><div class="note-box">${esc(d.notes)}</div></section>` : ''}
      <div class="muted" style="font-size:13px;padding:0 4px">${esc(t('since',{d:gdate(d.created || today)}))}</div>
    </div>
  </div>`;
}
function statusBadge(st){ return `<span class="badge ${st==='paid'?'ok':st==='late'?'late':'open'}"><span class="dot"></span>${esc(t(st==='paid'?'pl_paid':st==='late'?'pl_late':'pl_open'))}</span>`; }

/* ------------------------------------------------------------------ donations */
function donRow(x, inDonor){
  const dn = donorById(x.donorId), c = campById(x.campaignId);
  return `<div class="row click" data-href="#/receipt/${x.id}" ${inDonor ? 'style="grid-template-columns:1fr auto auto"' : ''}>
    ${inDonor ? '' : `<div class="c-date">${dateCell(x.date)}</div>`}
    <div class="c-who">${inDonor ? `<div class="name">${esc(lang==='yi'?hdate(x.date):gdate(x.date,true))}</div><div class="meta">${esc(cname(c))}${x.note ? ' · ' + esc(x.note) : ''}</div>` :
      `<div class="who">${avatar(dn)}<div><div class="name">${esc(dname(dn))}</div><div class="meta">${x.note ? esc(x.note) : '<span class="m-only">' + esc(cname(c)) + '</span>'}</div></div></div>`}</div>
    ${inDonor ? '' : `<div class="c-camp meta">${esc(cname(c))}</div><div class="c-meth">${methodBadge(x.method, x.checkNo)}<span class="m-only hdate">${esc(lang==='yi'?hdate(x.date):gdate(x.date,true))}</span></div>`}
    <div class="c-amt amt num">${moneyAuto(x.amount)}</div>
    <div class="c-act row-actions">
      <a class="btn sm ghost" href="#/receipt/${x.id}" title="${esc(t('receipt'))}" aria-label="${esc(t('receipt'))}">${icon('receipt')}</a>
      <button class="btn sm ghost" data-act="edit-donation" data-id="${x.id}" title="${esc(t('edit'))}" aria-label="${esc(t('edit'))}">${icon('pencil')}</button>
    </div>
  </div>`;
}
function donFiltered(){
  const f = ui.don, today = todayISO(), y = today.slice(0,4);
  let from = '', to = '';
  if (f.period === 'month') { from = today.slice(0,7) + '-01'; }
  else if (f.period === '30') { from = addDays(today, -30); }
  else if (f.period === 'year') { from = y + '-01-01'; }
  else if (f.period === 'last') { from = (y-1) + '-01-01'; to = (y-1) + '-12-31'; }
  const q = norm(f.q);
  return S.donations.filter(x => {
    if (from && x.date < from) return false; if (to && x.date > to) return false;
    if (f.camp && (f.camp === '_' ? x.campaignId : x.campaignId !== f.camp)) return false;
    if (f.method && x.method !== f.method) return false;
    if (q){ const d = donorById(x.donorId); if (!(d && donorMatch(d, f.q)) && !norm(x.checkNo).includes(q) && !norm(x.note).includes(q) && !norm(x.receiptNo).includes(q) && !String(x.amount).includes(q)) return false; }
    return true;
  }).sort((a,b) => b.date.localeCompare(a.date) || (b.receiptNo||'').localeCompare(a.receiptNo||''));
}
function pDonations(r){
  if (r.q.campaign != null) { ui.don.camp = r.q.campaign; ui.don.period = 'all'; }
  if (r.q.period) ui.don.period = r.q.period;
  const f = ui.don;
  return `
  <div class="page-head">
    <div><h1>${esc(t('nav_donations'))}</h1><div class="sub" id="dsub"></div></div>
    <div class="actions"><button class="btn" data-act="export-donations">${icon('download')}<span>${esc(t('export'))}</span></button></div>
  </div>
  <section class="card t-don">
    <div class="toolbar">
      <div class="search">${icon('search')}<input id="nq" type="search" value="${esc(f.q)}" placeholder="${esc(t('search_don'))}"></div>
      <select class="select" id="ncamp"><option value="">${esc(t('all_camps'))}</option>${S.campaigns.map(c => `<option value="${c.id}" ${f.camp===c.id?'selected':''}>${esc(cname(c))}</option>`).join('')}<option value="_" ${f.camp==='_'?'selected':''}>${esc(t('r_general'))}</option></select>
      <select class="select" id="nmeth"><option value="">${esc(t('all_methods'))}</option>${['cash','check','card','zelle'].map(m => `<option value="${m}" ${f.method===m?'selected':''}>${esc(t('m_'+m))}</option>`).join('')}</select>
    </div>
    <div class="toolbar" style="padding-top:12px;padding-bottom:12px"><div class="chips" id="nper">${['all','month','30','year','last'].map(p => `<button class="chip ${f.period===p?'on':''}" data-p="${p}">${esc(t('p_'+p))}</button>`).join('')}</div></div>
    <div class="sumline" id="nsum"></div>
    <div class="thead"><div>${esc(t('col_date'))}</div><div>${esc(t('col_donor'))}</div><div>${esc(t('col_camp'))}</div><div>${esc(t('col_method'))}</div><div class="r">${esc(t('col_amount'))}</div><div></div></div>
    <div class="rows" id="nlist"></div>
  </section>`;
}
let nLimit = 60;
function fillDonations(reset){
  const el = $('#nlist'); if (!el) return;
  if (reset) nLimit = 60;
  const list = donFiltered(), tot = sum(list);
  $('#dsub').innerHTML = t('donations_sub',{n:N(list.length), a:N(money(tot))});
  $('#nsum').innerHTML = `<span>${esc(t('count'))}: <b class="num">${list.length}</b></span><span>${esc(t('total'))}: <b class="num">${money(tot)}</b></span><span>${esc(t('avg'))}: <b class="num">${money(list.length ? tot / list.length : 0)}</b></span>${(ui.don.q||ui.don.camp||ui.don.method||ui.don.period!=='all') ? `<button class="link-btn" data-act="clear-don">${esc(t('clear'))}</button>` : ''}`;
  el.innerHTML = list.length ? list.slice(0, nLimit).map(x => donRow(x)).join('') + (list.length > nLimit ? `<div style="padding:16px;text-align:center"><button class="btn" data-act="more-don">+ ${list.length - nLimit}</button></div>` : '') : `<div class="empty-state"><b>${esc(t('no_match'))}</b>${esc(t('no_match_sub'))}</div>`;
}

/* ------------------------------------------------------------------ pledges */
function pPledges(){
  const all = S.pledges, tot = sum(all), paid = all.reduce((s, p) => s + Math.min(p.amount, paidOn(p)), 0);
  return `
  <div class="page-head">
    <div><h1>${esc(t('nav_pledges'))}</h1><div class="sub">${t('pl_sub',{n:N(all.length), a:N(money(tot - paid))})}</div></div>
    <div class="actions"><button class="btn hide-m" data-act="export-pledges">${icon('download')}${esc(t('export'))}</button><button class="btn primary" data-act="add-pledge">${icon('plus')}<span>${esc(t('new_pledge'))}</span></button></div>
  </div>
  <div class="kpis k3">
    <div class="card kpi"><div class="lbl">${esc(t('pledged_total'))}</div><div class="val num">${money(tot)}</div></div>
    <div class="card kpi"><div class="lbl">${esc(t('collected'))}</div><div class="val num">${money(paid)}</div><div class="foot"><div class="prog done" style="flex:1"><span style="width:${(tot?paid/tot*100:0).toFixed(1)}%"></span></div><span class="num">${tot?Math.round(paid/tot*100):0}%</span></div></div>
    <div class="card kpi"><div class="lbl">${esc(t('outstanding'))}</div><div class="val num" style="color:var(--warn)">${money(tot - paid)}</div></div>
  </div>
  <section class="card t-pl">
    <div class="toolbar"><div class="chips" id="plf">${['open','late','paid','all'].map(k => `<button class="chip ${ui.pl.f===k?'on':''}" data-f="${k}">${esc(t('pl_'+k))} <span class="num" style="opacity:.7">${k==='all'?all.length:all.filter(p => k==='open' ? pledgeStatus(p)!=='paid' : pledgeStatus(p)===k).length}</span></button>`).join('')}</div></div>
    <div class="thead"><div>${esc(t('col_donor'))}</div><div>${esc(t('col_camp'))}</div><div class="r">${esc(t('col_pledged'))}</div><div class="r">${esc(t('col_balance'))}</div><div>${esc(t('col_progress'))}</div><div></div></div>
    <div class="rows" id="pllist"></div>
  </section>`;
}
function fillPledges(){
  const el = $('#pllist'); if (!el) return;
  const f = ui.pl.f;
  const list = S.pledges.filter(p => f === 'all' ? true : f === 'open' ? pledgeStatus(p) !== 'paid' : pledgeStatus(p) === f)
    .sort((a,b) => (a.due||'9999').localeCompare(b.due||'9999'));
  el.innerHTML = list.length ? list.map(p => {
    const dn = donorById(p.donorId), paid = paidOn(p), bal = Math.max(0, p.amount - paid), st = pledgeStatus(p);
    return `<div class="row">
      <div class="c-who"><a class="who" href="#/donor/${p.donorId}" style="color:inherit">${avatar(dn)}<div><div class="name">${esc(dname(dn))}</div><div class="meta">${p.due ? esc(t('due_on',{d:gdate(p.due, true)})) : ''}</div></div></a></div>
      <div class="c-camp meta">${esc(cname(campById(p.campaignId)))}</div>
      <div class="c-amt r num">${money(p.amount)}</div>
      <div class="c-bal amt num" style="${bal?'':'color:var(--ink-3)'}">${money(bal)}</div>
      <div class="c-prog"><div style="display:flex;align-items:center;gap:8px"><div class="prog ${st==='paid'?'done':''}" style="flex:1"><span style="width:${Math.min(100, paid/p.amount*100).toFixed(1)}%"></span></div>${statusBadge(st)}</div></div>
      <div class="c-info meta" style="display:none">${esc(cname(campById(p.campaignId)))} · ${N(money(paid))} / ${N(money(p.amount))}</div>
      <div class="c-act row-actions">${st !== 'paid' ? `<button class="btn sm" data-act="pay-pledge" data-id="${p.id}">${icon('plus')}${esc(t('record_pay'))}</button>` : ''}<button class="btn sm ghost" data-act="edit-pledge" data-id="${p.id}" aria-label="${esc(t('edit'))}">${icon('pencil')}</button></div>
    </div>`; }).join('') : `<div class="empty-state"><b>${esc(t('no_match'))}</b></div>`;
}

/* ------------------------------------------------------------------ campaigns */
function pCampaigns(){
  const today = todayISO();
  const list = S.campaigns.slice().sort((a, b) => (a.end && a.end < today) - (b.end && b.end < today) || (b.start||'').localeCompare(a.start||''));
  return `
  <div class="page-head">
    <div><h1>${esc(t('nav_camps'))}</h1><div class="sub">${esc(t('camp_sub',{n:S.campaigns.length}))}</div></div>
    <div class="actions"><button class="btn primary" data-act="add-camp">${icon('plus')}<span>${esc(t('new_camp'))}</span></button></div>
  </div>
  <div class="camps">${list.map(c => {
    const ds = S.donations.filter(d => d.campaignId === c.id), r = sum(ds), pct = c.goal ? r / c.goal * 100 : 0;
    const donorsN = new Set(ds.map(d => d.donorId)).size, ended = c.end && c.end < today;
    return `<section class="card camp-card">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start">
        <div><h3>${esc(cname(c))}</h3><div class="muted" style="font-size:13px;margin-top:4px">${esc(gdate(c.start, true))} – ${c.end ? esc(gdate(c.end, true)) : '…'}</div></div>
        <span class="badge ${ended ? '' : 'gold'}">${esc(campWhen(c))}</span>
      </div>
      <div><div class="big num">${money(r)}</div><div class="muted" style="font-size:14px">${esc(t('raised'))}${c.goal ? ` · ${Math.round(pct)}% ${esc(t('of'))} ${N(money(c.goal))}` : ''}</div></div>
      ${c.goal ? `<div class="prog ${r >= c.goal ? 'done' : ended ? '' : 'gold'}" style="height:10px"><span style="width:${Math.min(100, pct).toFixed(1)}%"></span></div>` : ''}
      <div class="camp-stats"><div><b class="num">${donorsN}</b>${esc(t('donors_n'))}</div><div><b class="num">${ds.length}</b>${esc(t('gifts_n'))}</div><div><b class="num">${money(ds.length ? r / ds.length : 0)}</b>${esc(t('avg_gift'))}</div></div>
      <div style="display:flex;gap:8px"><a class="btn sm" href="#/donations?campaign=${c.id}">${esc(t('view_donations'))}${icon('chev','flip')}</a><button class="btn sm ghost" data-act="edit-camp" data-id="${c.id}">${icon('pencil')}${esc(t('edit'))}</button></div>
    </section>`; }).join('')}</div>`;
}

/* ------------------------------------------------------------------ settings */
function pSettings(){
  const s = S.settings;
  const fld = (k, lbl, attrs='') => `<div class="field"><label for="s_${k}">${esc(t(lbl))}</label><input class="input" id="s_${k}" name="${k}" value="${esc(s[k])}" ${attrs}></div>`;
  return `
  <div class="page-head"><div><h1>${esc(t('nav_settings'))}</h1></div></div>
  <div class="set-grid">
    <form class="card" id="setform">
      <div class="card-h"><div><h2>${esc(t('set_org'))}</h2><div class="muted" style="font-size:13px">${esc(t('set_org_sub'))}</div></div></div>
      <div class="card-b">
        <div class="f2">${fld('orgYi','org_yi','dir="rtl"')}${fld('orgEn','org_en','dir="ltr"')}</div>
        <div class="field"><label for="s_address">${esc(t('org_addr'))}</label><textarea class="input" id="s_address" name="address" rows="2" dir="ltr">${esc(s.address)}</textarea></div>
        <div class="f2">${fld('ein','org_ein','dir="ltr"')}${fld('phone','org_phone','dir="ltr" type="tel"')}</div>
        <div class="f2">${fld('email','org_email','dir="ltr" type="email"')}${fld('signer','signer')}</div>
        ${fld('receiptNote','receipt_note')}
        <div><button class="btn primary" type="submit">${esc(t('save'))}</button> <a class="btn" href="#/receipt/${(S.donations[S.donations.length-1]||{}).id}">${icon('receipt')}${esc(t('r_preview'))}</a></div>
      </div>
    </form>
    <div class="grid">
      <section class="card">
        <div class="card-h"><h2>${esc(t('language'))}</h2></div>
        <div class="card-b"><div class="lang" style="width:max-content"><button data-act="lang" data-v="yi" class="${lang==='yi'?'on':''}">אידיש</button><button data-act="lang" data-v="en" class="${lang==='en'?'on':''}">English</button></div></div>
      </section>
      <section class="card">
        <div class="card-h"><div><h2>${esc(t('set_data'))}</h2><div class="muted" style="font-size:13px">${esc(t('set_data_sub'))}</div></div></div>
        <div class="card-b" style="display:flex;flex-wrap:wrap;gap:8px">
          <button class="btn" data-act="export-donations-all">${icon('download')}${esc(t('export_don'))}</button>
          <button class="btn" data-act="export-donors">${icon('download')}${esc(t('export_donors'))}</button>
          <button class="btn" data-act="export-pledges">${icon('download')}${esc(t('export_pl'))}</button>
        </div>
      </section>
      <section class="card danger-zone">
        <div class="card-h"><div><h2>${esc(t('demo'))}</h2></div><span class="demo-pill">${esc(t('demo'))}</span></div>
        <div class="card-b"><p style="margin:0;color:var(--ink-2);font-size:14px">${esc(t('demo_note'))}</p><p style="margin:0;color:var(--ink-3);font-size:13px">${esc(t('reset_desc'))}</p><div><button class="btn danger" data-act="reset">${icon('reset')}${esc(t('reset'))}</button></div></div>
      </section>
    </div>
  </div>`;
}

/* ------------------------------------------------------------------ receipt & statement */
function orgBlock(){
  const s = S.settings;
  const main = orgName(), alt = lang === 'yi' ? s.orgEn : s.orgYi;
  return `<div><div class="r-org">${esc(main)}</div>${alt && alt !== main ? `<div class="r-org-alt" dir="auto">${esc(alt)}</div>` : ''}
    <div class="r-addr" dir="ltr">${esc(s.address).replace(/\n/g,'<br>')}<br>${esc([s.phone, s.email].filter(Boolean).join(' · '))}${s.ein ? `<br>${esc(t('ein'))}: ${esc(s.ein)}` : ''}</div></div>`;
}
function legal(){
  const s = S.settings;
  const yi = lang === 'yi' ? `<p style="margin:0 0 8px">${esc(t('r_legal',{org: orgName()})).replace('501(c)(3)', '<span dir="ltr">501(c)(3)</span>')}</p>` : '';
  return `<div class="r-legal">${yi}<p style="margin:0" dir="ltr">${esc(T.en.r_legal.replace('{org}', s.orgEn || s.orgYi))}${s.ein ? ' Tax ID: ' + esc(s.ein) + '.' : ''}</p>${s.receiptNote ? `<p style="margin:8px 0 0">${esc(s.receiptNote)}</p>` : ''}</div>`;
}
function signBlock(){
  const s = S.settings;
  return `<div class="r-sign"><div class="line" style="border:0"><div class="r-lbl">${esc(t('r_date'))}</div>${bothDates(todayISO())}</div>
    <div><div class="sig">${esc((s.signer||'').split(',')[0])}</div><div class="line">${esc(s.signer)} — ${esc(t('r_sign'))}</div></div></div>`;
}
function pReceipt(r){
  const x = S.donations.find(d => d.id === r.id);
  if (!x) return `<div class="card empty-state"><b>${esc(t('no_match'))}</b><a href="#/donations">${esc(t('nav_donations'))}</a></div>`;
  const d = donorById(x.donorId), c = campById(x.campaignId), p = x.pledgeId ? pledgeById(x.pledgeId) : null;
  return `<div class="receipt-wrap">
    <div class="receipt-bar">
      <a class="btn" href="#/donor/${x.donorId}">${icon('back','flip')}${esc(dname(d))}</a>
      <div style="display:flex;gap:8px"><button class="btn" data-act="edit-donation" data-id="${x.id}">${icon('pencil')}${esc(t('edit'))}</button><button class="btn primary" data-act="print">${icon('printer')}${esc(t('r_print'))}</button></div>
    </div>
    <article class="paper">
      <div class="bsd">${esc(t('bsd'))}</div>
      <div class="r-head">${orgBlock()}<div class="r-badge"><div class="t">${esc(t('r_title'))}</div><div class="n">${esc(t('r_no'))} <b class="num">${esc(x.receiptNo || '')}</b></div><div class="demo-tag">DEMO</div></div></div>
      <div class="r-sec">
        <div><div class="r-lbl">${esc(t('r_from'))}</div><div class="r-val"><b>${esc(dname(d))}</b>${dalt(d) ? `<br><bdi>${esc(dalt(d))}</bdi>` : ''}<br><span dir="ltr">${esc(d ? d.address || '' : '')}${d && d.city ? ', ' + esc(d.city) : ''}</span></div></div>
        <div><div class="r-lbl">${esc(t('r_date'))}</div><div class="r-val">${bothDates(x.date)}</div>
          <div class="r-lbl" style="margin-top:16px">${esc(t('r_method'))}</div><div class="r-val">${esc(t('m_'+x.method))}${x.method==='check' && x.checkNo ? ' ' + N('#' + esc(x.checkNo)) : ''}</div></div>
      </div>
      <div class="r-amt"><div><div class="r-lbl">${esc(t('r_purpose'))}</div><div class="r-val">${esc(cname(c))}${p ? ` <span class="muted">(${esc(t('r_pledge_pay'))})</span>` : ''}${x.note ? `<br><span class="muted">${esc(x.note)}</span>` : ''}</div></div>
        <div style="text-align:end"><div class="r-lbl">${esc(t('r_amount'))}</div><div class="big num">${money(x.amount, true)}</div></div></div>
      ${legal()}
      ${signBlock()}
      <div class="r-thanks">${esc(t('r_thanks'))}</div>
    </article>
  </div>`;
}
function pStatement(r){
  const d = donorById(r.id), y = r.id2 || todayISO().slice(0,4);
  if (!d) return `<div class="card empty-state"><b>${esc(t('search_none'))}</b></div>`;
  const list = S.donations.filter(x => x.donorId === d.id && x.date.slice(0,4) === y).sort((a,b) => a.date.localeCompare(b.date));
  const years = [...new Set(S.donations.filter(x => x.donorId === d.id).map(x => x.date.slice(0,4)))].sort().reverse();
  return `<div class="receipt-wrap">
    <div class="receipt-bar">
      <a class="btn" href="#/donor/${d.id}">${icon('back','flip')}${esc(dname(d))}</a>
      <div style="display:flex;gap:8px">${years.length > 1 ? `<select class="select" id="styear">${years.map(v => `<option ${v===y?'selected':''}>${v}</option>`).join('')}</select>` : ''}<button class="btn primary" data-act="print">${icon('printer')}${esc(t('r_print'))}</button></div>
    </div>
    <article class="paper">
      <div class="bsd">${esc(t('bsd'))}</div>
      <div class="r-head">${orgBlock()}<div class="r-badge"><div class="t">${esc(t('r_stmt'))}</div><div class="n">${esc(t('r_stmt_for',{y}))}</div><div class="demo-tag">DEMO</div></div></div>
      <div class="r-sec"><div><div class="r-lbl">${esc(t('r_from'))}</div><div class="r-val"><b>${esc(dname(d))}</b>${dalt(d) ? `<br><bdi>${esc(dalt(d))}</bdi>` : ''}<br><span dir="ltr">${esc(d.address||'')}${d.city ? ', ' + esc(d.city) : ''}</span></div></div>
        <div><div class="r-lbl">${esc(t('r_total_y',{y}))}</div><div class="r-val" style="font-family:var(--serif);font-size:32px;font-weight:700">${N(money(sum(list), true))}</div></div></div>
      <table class="r-table"><thead><tr><th>${esc(t('r_no'))}</th><th>${esc(t('col_date'))}</th><th>${esc(t('r_purpose'))}</th><th>${esc(t('col_method'))}</th><th class="r">${esc(t('col_amount'))}</th></tr></thead>
        <tbody>${list.map(x => `<tr><td class="num">${esc(x.receiptNo)}</td><td>${esc(gdate(x.date, true))}</td><td>${esc(cname(campById(x.campaignId)))}</td><td>${esc(t('m_'+x.method))}${x.checkNo ? ' ' + N('#'+esc(x.checkNo)) : ''}</td><td class="r num">${money(x.amount, true)}</td></tr>`).join('')}</tbody>
        <tfoot><tr><td colspan="4">${esc(t('total'))}</td><td class="r num">${money(sum(list), true)}</td></tr></tfoot></table>
      ${legal()}
      ${signBlock()}
      <div class="r-thanks">${esc(t('r_thanks'))}</div>
    </article>
  </div>`;
}

/* ------------------------------------------------------------------ after-render wiring */
function after(r){
  window.scrollTo(0, 0);
  if (r.page === 'dash' || !['donors','donor','donations','pledges','campaigns','settings','receipt','statement'].includes(r.page)) { const el = $('#mchart'); if (el) drawChart(el); }
  if (r.page === 'donors'){ fillDonors(); $('#dq').addEventListener('input', e => { ui.donors.q = e.target.value; fillDonors(); }); $('#dsort').addEventListener('change', e => { ui.donors.sort = e.target.value; fillDonors(); }); }
  if (r.page === 'donations'){
    fillDonations(true);
    $('#nq').addEventListener('input', e => { ui.don.q = e.target.value; fillDonations(true); });
    $('#ncamp').addEventListener('change', e => { ui.don.camp = e.target.value; fillDonations(true); });
    $('#nmeth').addEventListener('change', e => { ui.don.method = e.target.value; fillDonations(true); });
    $('#nper').addEventListener('click', e => { const b = e.target.closest('[data-p]'); if (!b) return; ui.don.period = b.dataset.p; $$('#nper .chip').forEach(c => c.classList.toggle('on', c === b)); fillDonations(true); });
  }
  if (r.page === 'pledges'){ fillPledges(); $('#plf').addEventListener('click', e => { const b = e.target.closest('[data-f]'); if (!b) return; ui.pl.f = b.dataset.f; $$('#plf .chip').forEach(c => c.classList.toggle('on', c === b)); fillPledges(); }); }
  if (r.page === 'settings'){
    $('#setform').addEventListener('submit', e => { e.preventDefault(); const fd = new FormData(e.target); for (const [k, v] of fd) S.settings[k] = String(v).trim(); save(); toast(t('set_saved')); render(); });
  }
  if (r.page === 'statement'){ const s = $('#styear'); if (s) s.addEventListener('change', () => go(`#/statement/${r.id}/${s.value}`)); }
  wireSearch();
}

function wireSearch(){
  const inp = $('#gq'), pop = $('#gpop'); if (!inp) return;
  let hl = 0, res = [];
  const draw = () => {
    const q = inp.value.trim();
    if (!q){ pop.hidden = true; return; }
    const st = donorStats();
    res = S.donors.filter(d => donorMatch(d, q)).sort((a,b) => st[b.id].total - st[a.id].total).slice(0, 7);
    pop.innerHTML = res.length ? res.map((d, i) => `<a href="#/donor/${d.id}" class="${i===hl?'hl':''}"><span>${esc(dname(d))} <span class="muted" style="font-size:13px">${esc(dcity(d))}</span></span><span class="num muted">${money(st[d.id].total)}</span></a>`).join('') + `<a href="#/donors?q=${encodeURIComponent(q)}" class="muted" style="font-size:13px">${esc(t('search_all'))}</a>`
      : `<div class="empty">${esc(t('search_none'))}</div>`;
    pop.hidden = false;
  };
  inp.addEventListener('input', () => { hl = 0; draw(); });
  inp.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown'){ hl = Math.min(hl + 1, res.length - 1); draw(); e.preventDefault(); }
    else if (e.key === 'ArrowUp'){ hl = Math.max(hl - 1, 0); draw(); e.preventDefault(); }
    else if (e.key === 'Enter'){ if (res[hl]) go('#/donor/' + res[hl].id); }
    else if (e.key === 'Escape'){ inp.value = ''; pop.hidden = true; $('#gsearch').classList.remove('open'); }
  });
  inp.addEventListener('blur', () => setTimeout(() => { pop.hidden = true; if (!inp.value) $('#gsearch').classList.remove('open'); }, 180));
}

/* ------------------------------------------------------------------ modal helpers */
function modal(title, body, foot, opts={}){
  const root = $('#modal-root');
  root.innerHTML = `<div class="overlay" data-act="overlay"><form class="modal ${opts.sm?'sm':''}" novalidate role="dialog" aria-modal="true" aria-label="${esc(title)}">
    <div class="modal-h"><h3>${esc(title)}</h3><button type="button" class="icon-btn" data-act="close" aria-label="close" style="border:0">${icon('x')}</button></div>
    <div class="modal-b">${body}</div><div class="modal-f">${foot}</div></form></div>`;
  document.body.style.overflow = 'hidden';
  const f = $('form', root);
  setTimeout(() => { const first = $(opts.focus || 'input:not([type=hidden]),select', f); if (first && window.innerWidth > 860) first.focus(); }, 30);
  return f;
}
function closeModal(){ $('#modal-root').innerHTML = ''; document.body.style.overflow = ''; }
function confirmBox(msg, onYes){
  const f = modal(t('confirm_title'), `<p style="margin:0;color:var(--ink-2)">${msg}</p>`, `<button type="button" class="btn" data-act="close">${esc(t('cancel'))}</button><button type="submit" class="btn primary" style="background:var(--danger);border-color:var(--danger)">${esc(t('yes_del'))}</button>`, {sm:true, focus:'button[type=submit]'});
  f.addEventListener('submit', e => { e.preventDefault(); closeModal(); onYes(); });
}
function toast(msg, linkHref, linkText){
  const el = document.createElement('div'); el.className = 'toast';
  el.innerHTML = `<span>${esc(msg)}</span>${linkHref ? `<a href="${linkHref}">${esc(linkText)}</a>` : ''}`;
  $('#toast-root').appendChild(el); setTimeout(() => el.remove(), 6500);
}
function fieldErr(f, name, on){ const el = f.querySelector(`[data-f="${name}"]`); if (el) el.classList.toggle('err', on); return on; }
const today0 = () => todayISO();

/* ------------------------------------------------------------------ donation form */
function donationForm(x, preset={}){
  const isNew = !x;
  x = x || { donorId: preset.donorId || '', amount: preset.amount || '', date: today0(), method: 'check', checkNo:'', campaignId: preset.campaignId != null ? preset.campaignId : activeCampId(), note:'', pledgeId: preset.pledgeId || '' };
  const d = donorById(x.donorId);
  const body = `
    <div class="field" data-f="donor"><label>${esc(t('f_donor'))}</label>
      <div style="position:relative"><input class="input w100" id="fd_q" autocomplete="off" placeholder="${esc(t('f_donor_ph'))}" value="${esc(d ? dname(d) : '')}"><input type="hidden" name="donorId" value="${esc(x.donorId)}">
      <div class="search-pop" id="fd_pop" hidden></div></div><div class="errmsg">${esc(t('req'))}</div></div>
    <div class="f2 keep">
      <div class="field" data-f="amount"><label>${esc(t('f_amount'))}</label><div class="money"><span>$</span><input class="input num" name="amount" inputmode="decimal" value="${esc(x.amount)}" placeholder="0" dir="ltr"></div><div class="errmsg">${esc(t('amt_req'))}</div></div>
      <div class="field" data-f="date"><label>${esc(t('f_date'))}</label><input class="input" type="date" name="date" value="${esc(x.date)}" dir="ltr"><div class="hint" id="fd_h">${esc(lang==='yi'?hdate(x.date):hdate(x.date))}</div></div>
    </div>
    <div class="quick" id="fd_quick">${[18,36,52,100,180,360,500,1000,1800].map(v => `<button type="button" data-v="${v}">$${v.toLocaleString('en-US')}</button>`).join('')}</div>
    <div class="field"><label>${esc(t('f_method'))}</label><div class="seg" id="fd_m">${['cash','check','card','zelle'].map(m => `<button type="button" data-m="${m}" class="${x.method===m?'on':''}">${esc(t('m_'+m))}</button>`).join('')}</div><input type="hidden" name="method" value="${esc(x.method)}"></div>
    <div class="field" id="fd_chk" ${x.method==='check'?'':'hidden'}><label>${esc(t('check_no'))}</label><input class="input num" name="checkNo" inputmode="numeric" value="${esc(x.checkNo)}" dir="ltr"></div>
    <div class="field"><label>${esc(t('f_camp'))}</label><select class="select" name="campaignId"><option value="">${esc(t('f_none'))}</option>${S.campaigns.map(c => `<option value="${c.id}" ${x.campaignId===c.id?'selected':''}>${esc(cname(c))}</option>`).join('')}</select></div>
    <div class="field" id="fd_pl" hidden><label>${esc(t('f_pledge'))}</label><select class="select" name="pledgeId"></select></div>
    <div class="field"><label>${esc(t('f_note'))}</label><input class="input" name="note" value="${esc(x.note)}" placeholder="${esc(t('f_note_ph'))}"></div>`;
  const foot = `${!isNew ? `<button type="button" class="btn danger" data-act="del-donation" data-id="${x.id}">${icon('trash')}${esc(t('del'))}</button><span class="spacer"></span>` : ''}<button type="button" class="btn" data-act="close">${esc(t('cancel'))}</button><button type="submit" class="btn primary">${esc(t('save'))}</button>`;
  const f = modal(isNew ? t('new_donation') : t('edit_donation'), body, foot, {focus: x.donorId ? 'input[name=amount]' : '#fd_q'});
  const q = $('#fd_q', f), pop = $('#fd_pop', f), hid = f.donorId;
  const plWrap = $('#fd_pl', f), plSel = f.pledgeId;
  const fillPl = () => {
    const pls = S.pledges.filter(p => p.donorId === hid.value && (pledgeStatus(p) !== 'paid' || p.id === x.pledgeId));
    plWrap.hidden = !pls.length;
    plSel.innerHTML = `<option value="">${esc(t('f_no_pledge'))}</option>` + pls.map(p => `<option value="${p.id}" ${x.pledgeId===p.id?'selected':''}>${esc(cname(campById(p.campaignId)))} — ${esc(t('bal',{a:money(Math.max(0, p.amount - paidOn(p)))}))}</option>`).join('');
  };
  fillPl();
  plSel.addEventListener('change', () => { const p = pledgeById(plSel.value); if (p){ f.campaignId.value = p.campaignId || ''; if (!f.amount.value) f.amount.value = Math.max(0, p.amount - paidOn(p)); } });
  let hl = 0, res = [];
  const draw = () => {
    const v = q.value.trim();
    res = S.donors.filter(d => donorMatch(d, v)).slice(0, 6);
    pop.innerHTML = res.map((d, i) => `<a href="#" data-id="${d.id}" class="${i===hl?'hl':''}"><span>${esc(dname(d))}</span><span class="muted" style="font-size:13px">${esc(dcity(d))}</span></a>`).join('') + (v ? `<a href="#" data-new="1"><span>${icon('plus')} ${esc(t('f_add_new',{q:v}))}</span></a>` : '');
    pop.hidden = false;
  };
  const choose = id => { const d = donorById(id); hid.value = id; q.value = dname(d); pop.hidden = true; fieldErr(f, 'donor', false); x.pledgeId = x.pledgeId || ''; fillPl(); };
  q.addEventListener('focus', draw);
  q.addEventListener('input', () => { hid.value = ''; hl = 0; draw(); plWrap.hidden = true; });
  q.addEventListener('keydown', e => { if (pop.hidden) return; if (e.key === 'ArrowDown'){ hl = Math.min(hl+1, res.length-1); draw(); e.preventDefault(); } else if (e.key === 'ArrowUp'){ hl = Math.max(hl-1, 0); draw(); e.preventDefault(); } else if (e.key === 'Enter'){ e.preventDefault(); if (res[hl]) choose(res[hl].id); } });
  q.addEventListener('blur', () => setTimeout(() => pop.hidden = true, 200));
  pop.addEventListener('mousedown', e => e.preventDefault());
  pop.addEventListener('click', e => {
    e.preventDefault(); const a = e.target.closest('a'); if (!a) return;
    if (a.dataset.new){ const v = q.value.trim(); const heb = /[֐-׿]/.test(v); const nd = {id:uid('d'), nameEn: heb ? '' : v, nameYi: heb ? v : '', phone:'', email:'', address:'', city:'', cityYi:'', notes:'', created: today0()}; S.donors.push(nd); save(); choose(nd.id); }
    else choose(a.dataset.id);
  });
  $('#fd_quick', f).addEventListener('click', e => { const b = e.target.closest('button'); if (b){ f.amount.value = b.dataset.v; fieldErr(f, 'amount', false); } });
  $('#fd_m', f).addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; f.method.value = b.dataset.m; $$('#fd_m button', f).forEach(o => o.classList.toggle('on', o === b)); $('#fd_chk', f).hidden = b.dataset.m !== 'check'; });
  f.date.addEventListener('change', () => { $('#fd_h', f).textContent = hdate(f.date.value); });
  f.addEventListener('submit', e => {
    e.preventDefault();
    const amt = parseFloat(String(f.amount.value).replace(/[$,\s]/g, ''));
    const bad = [fieldErr(f, 'donor', !hid.value), fieldErr(f, 'amount', !(amt > 0)), fieldErr(f, 'date', !f.date.value)].some(Boolean);
    if (bad) return;
    const rec = { donorId: hid.value, amount: Math.round(amt * 100) / 100, date: f.date.value, method: f.method.value, checkNo: f.method.value === 'check' ? f.checkNo.value.trim() : '', campaignId: f.campaignId.value, note: f.note.value.trim(), pledgeId: plWrap.hidden ? '' : plSel.value };
    let id;
    if (isNew){ const y = rec.date.slice(0,4); S.seq = S.seq || {}; S.seq[y] = Math.max(S.seq[y] || 0, ...S.donations.filter(d => d.receiptNo && d.receiptNo.startsWith(y)).map(d => +d.receiptNo.split('-')[1])) + 1; id = uid('n'); S.donations.push(Object.assign({id, receiptNo:`${y}-${String(S.seq[y]).padStart(4,'0')}`}, rec)); }
    else { Object.assign(x, rec); id = x.id; }
    save(); closeModal(); render(); toast(t('saved_don'), '#/receipt/' + id, t('receipt'));
  });
}
function activeCampId(){ const td = today0(); const c = S.campaigns.find(c => c.start <= td && c.end >= td && c.id !== 'c2'); return c ? c.id : ''; }

/* ------------------------------------------------------------------ donor / pledge / campaign forms */
function donorForm(d){
  const isNew = !d; d = d || {nameEn:'', nameYi:'', phone:'', email:'', address:'', city:'', cityYi:'', notes:''};
  const body = `
    <div class="f2"><div class="field" data-f="name"><label>${esc(t('f_name_yi'))}</label><input class="input" name="nameYi" dir="rtl" value="${esc(d.nameYi)}"><div class="errmsg">${esc(t('name_req'))}</div></div>
    <div class="field"><label>${esc(t('f_name_en'))}</label><input class="input" name="nameEn" dir="ltr" value="${esc(d.nameEn)}"></div></div>
    <div class="f2"><div class="field"><label>${esc(t('f_phone'))}</label><input class="input" name="phone" type="tel" dir="ltr" value="${esc(d.phone)}"></div>
    <div class="field"><label>${esc(t('f_email'))}</label><input class="input" name="email" type="email" dir="ltr" value="${esc(d.email)}"></div></div>
    <div class="f2"><div class="field"><label>${esc(t('f_address'))}</label><input class="input" name="address" dir="ltr" value="${esc(d.address)}"></div>
    <div class="field"><label>${esc(t('f_city'))}</label><input class="input" name="city" value="${esc(lang==='yi' ? (d.cityYi || d.city) : (d.city || d.cityYi))}"></div></div>
    <div class="field"><label>${esc(t('f_notes'))}</label><textarea class="input" name="notes" rows="3">${esc(d.notes)}</textarea></div>`;
  const f = modal(isNew ? t('new_donor') : t('edit_donor'), body, `${!isNew ? `<button type="button" class="btn danger" data-act="del-donor" data-id="${d.id}">${icon('trash')}${esc(t('del'))}</button><span class="spacer"></span>` : ''}<button type="button" class="btn" data-act="close">${esc(t('cancel'))}</button><button type="submit" class="btn primary">${esc(t('save'))}</button>`, {focus: lang==='yi' ? 'input[name=nameYi]' : 'input[name=nameEn]'});
  f.addEventListener('submit', e => {
    e.preventDefault();
    const v = k => f[k].value.trim();
    if (fieldErr(f, 'name', !v('nameYi') && !v('nameEn'))) return;
    const city = v('city'), heb = /[֐-׿]/.test(city);
    const rec = {nameYi:v('nameYi'), nameEn:v('nameEn'), phone:v('phone'), email:v('email'), address:v('address'), notes:f.notes.value.trim()};
    if (heb){ rec.cityYi = city; if (isNew) rec.city = ''; } else { rec.city = city; if (isNew) rec.cityYi = ''; }
    if (!isNew && city !== (lang==='yi' ? (d.cityYi || d.city) : (d.city || d.cityYi))) { if (heb) rec.city = d.city && /[֐-׿]/.test(d.city) ? '' : d.city; else rec.cityYi = ''; }
    let id;
    if (isNew){ id = uid('d'); S.donors.push(Object.assign({id, created: today0()}, rec)); } else { Object.assign(d, rec); id = d.id; }
    save(); closeModal(); toast(t('saved_donor')); if (isNew) go('#/donor/' + id); else render();
  });
}
function pledgeForm(p, preset={}){
  const isNew = !p; p = p || {donorId: preset.donorId || '', campaignId: activeCampId(), amount:'', date: today0(), due:'', note:''};
  const body = `
    <div class="field" data-f="donor"><label>${esc(t('f_donor'))}</label><select class="select" name="donorId"><option value=""></option>${S.donors.slice().sort((a,b) => dname(a).localeCompare(dname(b), lang==='yi'?'he':'en')).map(d => `<option value="${d.id}" ${p.donorId===d.id?'selected':''}>${esc(dname(d))}</option>`).join('')}</select><div class="errmsg">${esc(t('req'))}</div></div>
    <div class="f2 keep"><div class="field" data-f="amount"><label>${esc(t('col_pledged'))}</label><div class="money"><span>$</span><input class="input num" name="amount" inputmode="decimal" dir="ltr" value="${esc(p.amount)}"></div><div class="errmsg">${esc(t('amt_req'))}</div></div>
    <div class="field"><label>${esc(t('f_camp'))}</label><select class="select" name="campaignId"><option value="">${esc(t('f_none'))}</option>${S.campaigns.map(c => `<option value="${c.id}" ${p.campaignId===c.id?'selected':''}>${esc(cname(c))}</option>`).join('')}</select></div></div>
    <div class="f2 keep"><div class="field"><label>${esc(t('f_date'))}</label><input class="input" type="date" name="date" dir="ltr" value="${esc(p.date)}"></div>
    <div class="field"><label>${esc(t('f_due'))}</label><input class="input" type="date" name="due" dir="ltr" value="${esc(p.due)}"></div></div>
    <div class="field"><label>${esc(t('f_note'))}</label><input class="input" name="note" value="${esc(p.note)}"></div>`;
  const f = modal(isNew ? t('new_pledge') : t('edit_pledge'), body, `${!isNew ? `<button type="button" class="btn danger" data-act="del-pledge" data-id="${p.id}">${icon('trash')}${esc(t('del'))}</button><span class="spacer"></span>` : ''}<button type="button" class="btn" data-act="close">${esc(t('cancel'))}</button><button type="submit" class="btn primary">${esc(t('save'))}</button>`);
  f.addEventListener('submit', e => {
    e.preventDefault();
    const amt = parseFloat(String(f.amount.value).replace(/[$,\s]/g, ''));
    if ([fieldErr(f, 'donor', !f.donorId.value), fieldErr(f, 'amount', !(amt > 0))].some(Boolean)) return;
    const rec = {donorId:f.donorId.value, amount:amt, campaignId:f.campaignId.value, date:f.date.value || today0(), due:f.due.value, note:f.note.value.trim()};
    if (isNew) S.pledges.push(Object.assign({id:uid('p')}, rec)); else Object.assign(p, rec);
    save(); closeModal(); render(); toast(t('saved_pledge'));
  });
}
function campForm(c){
  const isNew = !c; c = c || {nameYi:'', nameEn:'', goal:'', start: today0(), end:''};
  const body = `
    <div class="field" data-f="name"><label>${esc(t('f_name_yi'))}</label><input class="input" name="nameYi" dir="rtl" value="${esc(c.nameYi)}"><div class="errmsg">${esc(t('f_camp_name_req'))}</div></div>
    <div class="field"><label>${esc(t('f_name_en'))}</label><input class="input" name="nameEn" dir="ltr" value="${esc(c.nameEn)}"></div>
    <div class="field"><label>${esc(t('f_goal'))}</label><div class="money"><span>$</span><input class="input num" name="goal" inputmode="decimal" dir="ltr" value="${esc(c.goal)}"></div></div>
    <div class="f2 keep"><div class="field"><label>${esc(t('f_start'))}</label><input class="input" type="date" name="start" dir="ltr" value="${esc(c.start)}"></div>
    <div class="field"><label>${esc(t('f_end'))}</label><input class="input" type="date" name="end" dir="ltr" value="${esc(c.end)}"></div></div>`;
  const f = modal(isNew ? t('new_camp') : t('edit_camp'), body, `${!isNew ? `<button type="button" class="btn danger" data-act="del-camp" data-id="${c.id}">${icon('trash')}${esc(t('del'))}</button><span class="spacer"></span>` : ''}<button type="button" class="btn" data-act="close">${esc(t('cancel'))}</button><button type="submit" class="btn primary">${esc(t('save'))}</button>`);
  f.addEventListener('submit', e => {
    e.preventDefault();
    if (fieldErr(f, 'name', !f.nameYi.value.trim() && !f.nameEn.value.trim())) return;
    const rec = {nameYi:f.nameYi.value.trim(), nameEn:f.nameEn.value.trim(), goal: parseFloat(String(f.goal.value).replace(/[$,\s]/g,'')) || 0, start:f.start.value || today0(), end:f.end.value};
    if (isNew) S.campaigns.push(Object.assign({id:uid('c')}, rec)); else Object.assign(c, rec);
    save(); closeModal(); render(); toast(t('saved_camp'));
  });
}

/* ------------------------------------------------------------------ CSV */
function csv(name, header, rows){
  const q = v => { const s = String(v ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const text = '\ufeff' + [header, ...rows].map(r => r.map(q).join(',')).join('\r\n');
  const blob = new Blob([text], {type:'text/csv;charset=utf-8'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
function exportDonations(list){
  csv(`donations-${todayISO()}.csv`, ['Receipt #','Date','Hebrew date','Donor','Donor (Yiddish)','Amount','Method','Check #','Campaign','Pledge','Note'],
    list.slice().sort((a,b) => a.date.localeCompare(b.date)).map(x => { const d = donorById(x.donorId) || {}, c = campById(x.campaignId); return [x.receiptNo, x.date, hdate(x.date), d.nameEn, d.nameYi, x.amount.toFixed(2), T.en['m_'+x.method], x.checkNo, c ? c.nameEn : 'General', x.pledgeId ? 'yes' : '', x.note]; }));
}
function exportDonors(){
  const st = donorStats();
  csv(`donors-${todayISO()}.csv`, ['Name','Name (Yiddish)','Phone','Email','Address','City','Gifts','Total given','This year','Last gift','Notes'],
    S.donors.map(d => [d.nameEn, d.nameYi, d.phone, d.email, d.address, d.city || d.cityYi, st[d.id].n, st[d.id].total.toFixed(2), st[d.id].year.toFixed(2), st[d.id].last, d.notes]));
}
function exportPledges(){
  csv(`pledges-${todayISO()}.csv`, ['Donor','Donor (Yiddish)','Campaign','Pledged','Paid','Balance','Date','Due','Status','Note'],
    S.pledges.map(p => { const d = donorById(p.donorId) || {}, c = campById(p.campaignId), paid = paidOn(p); return [d.nameEn, d.nameYi, c ? c.nameEn : 'General', p.amount.toFixed(2), paid.toFixed(2), Math.max(0, p.amount - paid).toFixed(2), p.date, p.due, pledgeStatus(p), p.note]; }));
}

/* ------------------------------------------------------------------ global events */
document.addEventListener('click', e => {
  const rowLink = e.target.closest('[data-href]');
  const a = e.target.closest('[data-act]');
  if (!a && rowLink && !e.target.closest('a,button')) { go(rowLink.dataset.href); return; }
  if (!a) return;
  const act = a.dataset.act, id = a.dataset.id;
  if (act === 'overlay'){ if (e.target === a) closeModal(); return; }
  if (a.tagName === 'A' && act !== 'overlay') e.preventDefault();
  switch (act){
    case 'lang': lang = a.dataset.v; S.settings.lang = lang; save(); render(); if ($('#modal-root').innerHTML) closeModal(); break;
    case 'close': closeModal(); break;
    case 'search-toggle': { const s = $('#gsearch'); s.classList.add('open'); $('#gq').focus(); break; }
    case 'add-donation': donationForm(null, {donorId: a.dataset.donor}); break;
    case 'edit-donation': donationForm(S.donations.find(x => x.id === id)); break;
    case 'del-donation': { const x = S.donations.find(d => d.id === id); confirmBox(esc(t('confirm_del_don',{a:money(x.amount), name:dname(donorById(x.donorId))})), () => { S.donations = S.donations.filter(d => d.id !== id); save(); if (route().page === 'receipt') go('#/donations'); else render(); toast(t('deleted')); }); break; }
    case 'add-donor': donorForm(); break;
    case 'edit-donor': donorForm(donorById(id)); break;
    case 'del-donor': { const d = donorById(id); confirmBox(esc(t('confirm_del_donor',{name:dname(d), n:S.donations.filter(x => x.donorId === id).length, p:S.pledges.filter(x => x.donorId === id).length})), () => { S.donors = S.donors.filter(x => x.id !== id); S.donations = S.donations.filter(x => x.donorId !== id); S.pledges = S.pledges.filter(x => x.donorId !== id); save(); go('#/donors'); toast(t('deleted')); }); break; }
    case 'add-pledge': pledgeForm(null, {donorId: a.dataset.donor}); break;
    case 'edit-pledge': pledgeForm(pledgeById(id)); break;
    case 'del-pledge': confirmBox(esc(t('confirm_del_pl')), () => { S.pledges = S.pledges.filter(p => p.id !== id); S.donations.forEach(d => { if (d.pledgeId === id) d.pledgeId = ''; }); save(); render(); toast(t('deleted')); }); break;
    case 'pay-pledge': { const p = pledgeById(id); donationForm(null, {donorId:p.donorId, pledgeId:p.id, campaignId:p.campaignId || '', amount: Math.max(0, p.amount - paidOn(p))}); break; }
    case 'add-camp': campForm(); break;
    case 'edit-camp': campForm(campById(id)); break;
    case 'del-camp': confirmBox(esc(t('confirm_del_camp')), () => { S.campaigns = S.campaigns.filter(c => c.id !== id); S.donations.forEach(d => { if (d.campaignId === id) d.campaignId = ''; }); S.pledges.forEach(p => { if (p.campaignId === id) p.campaignId = ''; }); save(); render(); toast(t('deleted')); }); break;
    case 'export-donations': exportDonations(donFiltered()); break;
    case 'export-donations-all': exportDonations(S.donations); break;
    case 'export-donors': exportDonors(); break;
    case 'export-pledges': exportPledges(); break;
    case 'clear-don': ui.don = {q:'', period:'all', camp:'', method:''}; if (location.hash.includes('?')) { history.replaceState(null, '', '#/donations'); } render(); break;
    case 'more-don': nLimit += 100; fillDonations(); break;
    case 'print': window.print(); break;
    case 'reset': confirmBox(esc(t('reset_q')), () => { const l = lang; S = seed(); S.settings.lang = l; save(); ui.don = {q:'', period:'all', camp:'', method:''}; go('#/'); render(); toast(t('reset_done')); }); break;
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('#modal-root').innerHTML) closeModal(); });
window.addEventListener('hashchange', () => { closeModal(); render(); });
let rT; window.addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(() => { const el = $('#mchart'); if (el) drawChart(el); }, 150); });

load();
render();
})();
