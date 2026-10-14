/* Local language and published-content lookup. No network requests or remote model. */
(function () {
  'use strict';
  var scriptUrl = document.currentScript && document.currentScript.src;

  var languages = [
    { code: 'en', name: 'English', locale: 'en-US', dir: 'ltr' },
    { code: 'ur', name: 'اردو', locale: 'ur-PK', dir: 'rtl' },
    { code: 'ar', name: 'العربية', locale: 'ar-SA', dir: 'rtl' }
  ];
  var language = 'en';
  var savedLanguage = 'en';
  var localeKeywords = Object.create(null);
  // Domain evidence outranks generic words such as "detection".
  var domainRules = {"en":{"finance":["financial","finance","credit card","credit-card","bank fraud","banking fraud","bank transaction","transaction anomaly","transaction outlier","transaction analytics","transaction prediction","transaction data"],"fraud":["fraud","scalping","bot purchasing"],"anomaly":["anomaly","anomalies","outlier"],"visual":["computer vision","cv","image","video","camera","cctv","object detection","face recognition","facial","yolo","opencv","segmentation","visual inspection"],"note":"The published fraud example covers ticket scalping. A financial-transaction deployment or accuracy result is not documented here; share your data and requirements to discuss suitability.","related":"Related ticketing project"},"ur":{"finance":["مالی","فنانس","لین دین","ٹرانزیکشن","کریڈٹ کارڈ","بینک فراڈ"],"fraud":["فراڈ","دھوکہ دہی","ٹکٹ اسکیلپنگ"],"anomaly":["غیر معمولی","بے ضابطگی","اناملی"],"visual":["تصویر","تصاویر","ویڈیو","کیمرہ","وژن","چہرے"],"note":"شائع شدہ فراڈ کی مثال ٹکٹ اسکیلپنگ سے متعلق ہے۔ یہاں مالی لین دین کی ڈیپلائمنٹ یا درستگی کے نتائج درج نہیں؛ موزونیت پر بات کرنے کے لیے اپنا ڈیٹا اور ضروریات بتائیں۔","related":"متعلقہ ٹکٹنگ پراجیکٹ"},"ar":{"finance":["مالي","مالية","معاملات","معاملة","بطاقة ائتمان","احتيال مصرفي"],"fraud":["احتيال","غش","إعادة بيع التذاكر"],"anomaly":["شذوذ","حالات شاذة","أنماط غير طبيعية"],"visual":["رؤية حاسوبية","صور","صورة","فيديو","كاميرا","وجوه"],"note":"يتعلق مثال الاحتيال المنشور بإعادة بيع التذاكر. لا تُوثّق هنا عملية نشر للمعاملات المالية أو نتائج دقتها؛ شارك بياناتك ومتطلباتك لمناقشة الملاءمة.","related":"مشروع تذاكر ذو صلة"},"zh":{"finance":["金融","财务","交易","信用卡","银行欺诈"],"fraud":["欺诈","诈骗","黄牛"],"anomaly":["异常","离群"],"visual":["计算机视觉","图像","图片","视频","摄像","人脸"],"note":"已发布的欺诈案例涉及防止票务倒卖。这里未记录金融交易部署或准确率结果；请提供数据与需求，以讨论是否适合。","related":"相关票务项目"},"hi":{"finance":["वित्तीय","वित्त","लेनदेन","लेन-देन","क्रेडिट कार्ड","बैंक धोखाधड़ी"],"fraud":["धोखाधड़ी","धोखाधड़ी","टिकट कालाबाजारी"],"anomaly":["विसंगति","असामान्य","आउटलायर"],"visual":["कंप्यूटर विज़न","कंप्यूटर विजन","छवि","चित्र","वीडियो","कैमरा","चेहरा"],"note":"प्रकाशित धोखाधड़ी का उदाहरण टिकट कालाबाजारी से संबंधित है। यहाँ वित्तीय लेनदेन की तैनाती या सटीकता के परिणाम दर्ज नहीं हैं; उपयुक्तता पर चर्चा के लिए अपना डेटा और आवश्यकताएँ साझा करें।","related":"संबंधित टिकटिंग प्रोजेक्ट"},"es":{"finance":["financier","finanzas","transaccion","transacción","tarjeta de crédito","fraude bancario"],"fraud":["fraude","estafa","reventa de entradas"],"anomaly":["anomalía","anomalia","atípico"],"visual":["visión artificial","visión por computador","imagen","vídeo","video","cámara","rostro"],"note":"El ejemplo de fraude publicado trata sobre la reventa de entradas. Aquí no se documenta un despliegue de transacciones financieras ni resultados de precisión; comparta sus datos y requisitos para valorar la adecuación.","related":"Proyecto relacionado de entradas"},"fr":{"finance":["financi","finance","transaction","carte de crédit","fraude bancaire"],"fraud":["fraude","escroquerie","revente de billets"],"anomaly":["anomalie","valeur aberrante"],"visual":["vision par ordinateur","image","vidéo","caméra","visage"],"note":"L’exemple de fraude publié concerne la revente de billets. Aucun déploiement de transactions financières ni résultat de précision n’est documenté ici ; partagez vos données et besoins pour en discuter.","related":"Projet de billetterie associé"},"pt":{"finance":["financeir","finanças","transação","transações","cartão de crédito","fraude bancária"],"fraud":["fraude","golpe","revenda de ingressos"],"anomaly":["anomalia","valor atípico"],"visual":["visão computacional","imagem","imagens","vídeo","câmera","rosto"],"note":"O exemplo de fraude publicado aborda a revenda de ingressos. Não há registro aqui de implantação em transações financeiras ou resultados de precisão; compartilhe dados e requisitos para avaliar a adequação.","related":"Projeto relacionado de ingressos"},"bn":{"finance":["আর্থিক","অর্থায়ন","লেনদেন","ক্রেডিট কার্ড","ব্যাংক জালিয়াতি"],"fraud":["জালিয়াতি","প্রতারণা","টিকিট কালোবাজারি"],"anomaly":["অস্বাভাবিক","ব্যতিক্রম","অ্যানোমালি"],"visual":["কম্পিউটার ভিশন","ছবি","চিত্র","ভিডিও","ক্যামেরা","মুখ"],"note":"প্রকাশিত জালিয়াতির উদাহরণটি টিকিট কালোবাজারি নিয়ে। এখানে আর্থিক লেনদেনের বাস্তবায়ন বা নির্ভুলতার ফল নথিভুক্ত নেই; উপযুক্ততা আলোচনার জন্য আপনার ডেটা ও চাহিদা জানান।","related":"সংশ্লিষ্ট টিকিটিং প্রকল্প"},"ru":{"finance":["финанс","транзакц","кредитн","банковское мошенничество"],"fraud":["мошеннич","перепродажа билетов"],"anomaly":["аномал","выброс"],"visual":["компьютерное зрение","изображен","видео","камер","лиц"],"note":"Опубликованный пример мошенничества относится к перепродаже билетов. Здесь не документированы внедрение для финансовых транзакций или показатели точности; сообщите данные и требования для обсуждения применимости.","related":"Связанный билетный проект"},"id":{"finance":["keuangan","finansial","transaksi","kartu kredit","penipuan bank"],"fraud":["penipuan","kecurangan","percaloan tiket"],"anomaly":["anomali","pencilan"],"visual":["visi komputer","gambar","video","kamera","wajah"],"note":"Contoh penipuan yang dipublikasikan berkaitan dengan percaloan tiket. Penerapan transaksi keuangan atau hasil akurasinya tidak didokumentasikan di sini; bagikan data dan kebutuhan untuk menilai kesesuaian.","related":"Proyek tiket terkait"},"de":{"finance":["finanz","transaktion","kreditkarte","bankbetrug"],"fraud":["betrug","ticketweiterverkauf"],"anomaly":["anomalie","ausreißer"],"visual":["computer vision","bild","video","kamera","gesicht"],"note":"Das veröffentlichte Betrugsbeispiel betrifft den Ticketweiterverkauf. Ein Einsatz für Finanztransaktionen oder Genauigkeitsergebnisse sind hier nicht dokumentiert; teilen Sie Daten und Anforderungen zur Prüfung der Eignung.","related":"Verwandtes Ticketprojekt"},"ja":{"finance":["金融","財務","取引","クレジットカード","銀行詐欺"],"fraud":["不正検知","不正検出","不正取引","不正行為","詐欺","チケット転売"],"anomaly":["異常","外れ値"],"visual":["コンピュータービジョン","画像","映像","動画","カメラ","顔"],"note":"公開されている不正検知の例はチケット転売対策です。金融取引への導入や精度の結果はここでは記載されていません。適合性を相談するため、データと要件をお知らせください。","related":"関連するチケットプロジェクト"},"tr":{"finance":["finans","mali işlem","işlem anomalisi","kredi kartı","banka dolandırıcılığı"],"fraud":["dolandırıcılık","sahtekârlık","bilet karaborsası"],"anomaly":["anomali","aykırı değer"],"visual":["bilgisayarlı görü","görüntü","video","kamera","yüz"],"note":"Yayımlanmış dolandırıcılık örneği bilet karaborsasıyla ilgilidir. Finansal işlemlerde kullanım veya doğruluk sonuçları burada belgelenmemiştir; uygunluğu görüşmek için veri ve gereksinimlerinizi paylaşın.","related":"İlgili biletleme projesi"},"vi":{"finance":["tài chính","giao dịch","thẻ tín dụng","gian lận ngân hàng"],"fraud":["gian lận","lừa đảo","đầu cơ vé"],"anomaly":["bất thường","ngoại lệ"],"visual":["thị giác máy tính","hình ảnh","video","camera","khuôn mặt"],"note":"Ví dụ gian lận đã công bố liên quan đến đầu cơ vé. Trang này không ghi nhận triển khai giao dịch tài chính hoặc kết quả độ chính xác; hãy chia sẻ dữ liệu và yêu cầu để trao đổi mức phù hợp.","related":"Dự án bán vé liên quan"},"ko":{"finance":["금융","재무","거래","신용카드","은행 사기"],"fraud":["사기","부정 거래","부정거래","암표"],"anomaly":["이상 탐지","이상탐지","이상 감지","이상 현상","이상치"],"visual":["컴퓨터 비전","이미지","영상","비디오","카메라","얼굴"],"note":"공개된 사기 탐지 사례는 티켓 암표 방지에 관한 것입니다. 금융 거래 배포나 정확도 결과는 여기에 기록되어 있지 않습니다. 적합성을 논의할 데이터와 요구 사항을 알려 주세요.","related":"관련 티켓 프로젝트"},"th":{"finance":["การเงิน","ธุรกรรม","บัตรเครดิต","การฉ้อโกงธนาคาร"],"fraud":["ฉ้อโกง","ทุจริต","เก็งกำไรบัตร"],"anomaly":["ผิดปกติ","ค่าผิดปกติ"],"visual":["คอมพิวเตอร์วิทัศน์","ภาพ","วิดีโอ","กล้อง","ใบหน้า"],"note":"ตัวอย่างการตรวจจับทุจริตที่เผยแพร่เกี่ยวกับการเก็งกำไรบัตร ไม่มีการบันทึกการใช้งานกับธุรกรรมการเงินหรือผลความแม่นยำไว้ที่นี่ โปรดแจ้งข้อมูลและความต้องการเพื่อหารือความเหมาะสม","related":"โครงการบัตรที่เกี่ยวข้อง"},"fa":{"finance":["مالی","تراکنش","کارت اعتباری","تقلب بانکی"],"fraud":["تقلب","کلاهبرداری","فروش مجدد بلیت"],"anomaly":["ناهنجار","داده پرت"],"visual":["بینایی ماشین","تصویر","ویدیو","دوربین","چهره"],"note":"نمونه منتشرشده تقلب مربوط به فروش مجدد بلیت است. استقرار برای تراکنش مالی یا نتیجه دقت آن در اینجا ثبت نشده؛ داده‌ها و نیازهایتان را برای بررسی تناسب مطرح کنید.","related":"پروژه مرتبط بلیت"},"ta":{"finance":["நிதி","பரிவர்த்தனை","கடன் அட்டை","வங்கி மோசடி"],"fraud":["மோசடி","டிக்கெட் மறுவிற்பனை"],"anomaly":["முரண்பாடு","அசாதாரண","புறப்புள்ளி"],"visual":["கணினிப் பார்வை","படம்","படங்கள்","காணொளி","கேமரா","முகம்"],"note":"வெளியிடப்பட்ட மோசடி உதாரணம் டிக்கெட் மறுவிற்பனையைப் பற்றியது. நிதிப் பரிவர்த்தனைப் பயன்பாடு அல்லது துல்லிய முடிவுகள் இங்கு ஆவணப்படுத்தப்படவில்லை; பொருத்தத்தைப் பேச உங்கள் தரவையும் தேவைகளையும் பகிரவும்.","related":"தொடர்புடைய டிக்கெட் திட்டம்"},"te":{"finance":["ఆర్థిక","లావాదేవీ","లావాదేవీలు","క్రెడిట్ కార్డ్","బ్యాంకు మోసం"],"fraud":["మోసం","మోసపూరిత","టికెట్ పునర్విక్రయం"],"anomaly":["అసాధారణ","అనామలీ","అవుట్‌లయర్"],"visual":["కంప్యూటర్ విజన్","చిత్రం","చిత్రాలు","వీడియో","కెమెరా","ముఖం"],"note":"ప్రచురించిన మోసం ఉదాహరణ టికెట్ పునర్విక్రయానికి సంబంధించినది. ఆర్థిక లావాదేవీల అమలు లేదా ఖచ్చితత్వ ఫలితాలు ఇక్కడ నమోదు కాలేదు; అనుకూలతను చర్చించేందుకు మీ డేటా, అవసరాలను పంచుకోండి.","related":"సంబంధిత టికెట్ ప్రాజెక్ట్"}};
  try {
    // A fresh page session starts in English; explicit choices follow navigation.
    var saved = sessionStorage.getItem('portfolio-language');
    if (saved) savedLanguage = saved;
    if (languages.some(function (item) { return item.code === saved; })) language = saved;
  } catch (_) { /* File previews and private sessions may restrict storage. */ }

  var ui = {
    en: {
      greeting: 'Welcome to the official portfolio of Muhammad Hamza, AI Engineer.',
      help: 'How can I help you?', services: 'Explore services', resume: 'Technical resume',
      projects: 'Projects', contact: 'Contact', stop: 'Stop', hide: 'Hide', play: 'Play voice',
      replay: 'Replay tour', ask: 'Ask a question', send: 'Send',
      questionPlaceholder: 'Ask about RAG, AI agents, projects or contact…',
      assistantNote: 'Rule-based answers from published portfolio information.',
      soundBlocked: 'Tap Play voice to enable sound.',
      soundBlockedShort: 'Tap Play to enable sound', voiceUnavailableShort: 'No voice for this language',
      agents: 'AI agents', vision: 'Computer vision',
      voiceUnavailable: 'A voice for this language is unavailable on this device. Read the captions or choose another language.',
      stopped: 'Tour stopped. Explore at your own pace.', language: 'Language', voice: 'Voice',
      autoScroll: 'Auto-scroll', unknown: 'I can help with the services listed in this portfolio. Contact Muhammad Hamza to discuss your requirements.',
      cost: 'Scope and price depend on your requirements. Share your project details on the Contact page to discuss a proposal.',
      timeline: 'The portfolio does not publish fixed delivery times. Share your requirements on the Contact page to discuss the schedule.',
      tourWelcome: 'Welcome to the official portfolio of Muhammad Hamza, AI Engineer. Explore generative AI, agentic systems, computer vision, and machine learning. Choose a project, or ask the assistant how I can help.',
      tourServices: 'Explore services in generative AI, agentic AI, computer vision, and classical machine learning, including retrieval augmented generation systems.',
      tourResume: 'Open the technical resume to review Muhammad Hamza’s experience, skills and research.',
      tourProjects: 'Visit Projects to explore selected engineering work.',
      tourContact: 'To discuss a project, use the Contact page and choose your preferred language. How can I help you?',
      showGuide: 'Show portfolio guide', closeQuestions: 'Close questions', source: 'View service', clear: 'Clear', muted: 'Voice off',
      serviceList: 'Published services include LLM and generative AI, RAG pipelines, AI agents, computer vision, NLP, AI web applications, AI research, data science, and MLOps. Which service interests you?',
      contactAnswer: 'Use the Contact page to share your project requirements, or email hamza.ai.official@gmail.com. The form asks for your name, email, subject and message.',
      resumeAnswer: 'The technical resume lists Muhammad Hamza’s experience, skills and research. Open the resume to review it.',
      projectsAnswer: 'Open Projects to review Muhammad Hamza’s selected engineering work.'
    },
    ur: {
      greeting: 'محمد حمزہ، اے آئی انجینئر، کے آفیشل پورٹ فولیو میں خوش آمدید۔',
      help: 'میں آپ کی کیسے مدد کر سکتا ہوں؟', services: 'خدمات دیکھیں', resume: 'ٹیکنیکل ریزیومے',
      projects: 'پراجیکٹس', contact: 'رابطہ', stop: 'روکیں', hide: 'چھپائیں', play: 'آواز چلائیں',
      replay: 'دوبارہ تعارف سنیں', ask: 'سوال پوچھیں', send: 'بھیجیں',
      questionPlaceholder: 'RAG، اے آئی ایجنٹس، پراجیکٹس یا رابطے کے بارے میں پوچھیں…',
      assistantNote: 'پورٹ فولیو کی شائع شدہ معلومات سے قواعد پر مبنی جوابات۔',
      soundBlocked: 'آواز سننے کے لیے «آواز چلائیں» دبائیں۔',
      soundBlockedShort: 'آواز سننے کے لیے چلائیں دبائیں', voiceUnavailableShort: 'اس زبان کی آواز دستیاب نہیں',
      agents: 'اے آئی ایجنٹس', vision: 'کمپیوٹر وژن',
      voiceUnavailable: 'اس آلے پر اس زبان کی آواز دستیاب نہیں۔ تحریری تعارف پڑھیں یا دوسری زبان منتخب کریں۔',
      stopped: 'تعارف روک دیا گیا۔ اپنی سہولت سے پورٹ فولیو دیکھیں۔', language: 'زبان', voice: 'آواز',
      autoScroll: 'خودکار اسکرول', unknown: 'میں اس پورٹ فولیو میں درج خدمات کے بارے میں مدد کر سکتا ہوں۔ اپنی ضروریات پر بات کرنے کے لیے محمد حمزہ سے رابطہ کریں۔',
      cost: 'کام کا دائرہ اور قیمت آپ کی ضروریات پر منحصر ہیں۔ تجویز پر بات کرنے کے لیے رابطہ صفحے پر پراجیکٹ کی تفصیلات بتائیں۔',
      timeline: 'پورٹ فولیو میں تکمیل کی مقررہ مدت شائع نہیں کی گئی۔ شیڈول پر بات کرنے کے لیے رابطہ صفحے پر اپنی ضروریات بتائیں۔',
      tourWelcome: 'محمد حمزہ، اے آئی انجینئر، کے آفیشل پورٹ فولیو میں خوش آمدید۔ جنریٹو اے آئی، ایجنٹک سسٹمز، کمپیوٹر وژن اور مشین لرننگ کا کام دیکھیں۔ کوئی پراجیکٹ منتخب کریں یا اسسٹنٹ سے پوچھیں کہ میں آپ کی کیسے مدد کر سکتا ہوں۔',
      tourServices: 'جنریٹو اے آئی، ایجنٹک اے آئی، کمپیوٹر وژن اور کلاسیکل مشین لرننگ کی خدمات دیکھیں، جن میں دستاویزات سے معلومات حاصل کرنے والے RAG سسٹمز بھی شامل ہیں۔',
      tourResume: 'محمد حمزہ کا تجربہ، مہارتیں اور تحقیق دیکھنے کے لیے ٹیکنیکل ریزیومے کھولیں۔',
      tourProjects: 'منتخب انجینئرنگ کام دیکھنے کے لیے پراجیکٹس پر جائیں۔',
      tourContact: 'اپنے پراجیکٹ پر بات کرنے کے لیے رابطہ صفحہ استعمال کریں اور اپنی پسند کی زبان منتخب کریں۔ میں آپ کی کیسے مدد کر سکتا ہوں؟',
      showGuide: 'پورٹ فولیو رہنما دکھائیں', closeQuestions: 'سوالات بند کریں', source: 'خدمت دیکھیں', clear: 'صاف کریں', muted: 'آواز بند',
      serviceList: 'درج خدمات میں LLM اور جنریٹو اے آئی، RAG پائپ لائنز، اے آئی ایجنٹس، کمپیوٹر وژن، NLP، اے آئی ویب ایپس، تحقیق، ڈیٹا سائنس اور MLOps شامل ہیں۔ آپ کس خدمت میں دلچسپی رکھتے ہیں؟',
      contactAnswer: 'اپنی پراجیکٹ کی ضروریات رابطہ صفحے پر بتائیں یا hamza.ai.official@gmail.com پر ای میل کریں۔ فارم میں نام، ای میل، موضوع اور پیغام درکار ہیں۔',
      resumeAnswer: 'ٹیکنیکل ریزیومے میں محمد حمزہ کا تجربہ، مہارتیں اور تحقیق درج ہیں۔ اسے دیکھنے کے لیے ریزیومے کھولیں۔',
      projectsAnswer: 'محمد حمزہ کا منتخب انجینئرنگ کام دیکھنے کے لیے پراجیکٹس کھولیں۔'
    },
    ar: {
      greeting: 'مرحباً بكم في الملف المهني الرسمي لمحمد حمزة، مهندس الذكاء الاصطناعي.',
      help: 'كيف يمكنني مساعدتك؟', services: 'استكشف الخدمات', resume: 'السيرة الذاتية التقنية',
      projects: 'المشاريع', contact: 'تواصل', stop: 'إيقاف', hide: 'إخفاء', play: 'تشغيل الصوت',
      replay: 'إعادة الجولة', ask: 'اطرح سؤالاً', send: 'إرسال',
      questionPlaceholder: 'اسأل عن RAG أو وكلاء الذكاء الاصطناعي أو المشاريع أو التواصل…',
      assistantNote: 'إجابات قائمة على قواعد من المعلومات المنشورة في الملف المهني.',
      soundBlocked: 'اضغط «تشغيل الصوت» لتفعيل الصوت.',
      soundBlockedShort: 'اضغط تشغيل لتفعيل الصوت', voiceUnavailableShort: 'لا يتوفر صوت لهذه اللغة',
      agents: 'وكلاء الذكاء الاصطناعي', vision: 'الرؤية الحاسوبية',
      voiceUnavailable: 'لا يتوفر صوت لهذه اللغة على هذا الجهاز. اقرأ النص أو اختر لغة أخرى.',
      stopped: 'تم إيقاف الجولة. استكشف الموقع بالسرعة التي تناسبك.', language: 'اللغة', voice: 'الصوت',
      autoScroll: 'التمرير التلقائي', unknown: 'يمكنني مساعدتك بشأن الخدمات المدرجة في هذا الملف المهني. تواصل مع محمد حمزة لمناقشة متطلباتك.',
      cost: 'يعتمد نطاق العمل والسعر على متطلباتك. شارك تفاصيل مشروعك في صفحة التواصل لمناقشة عرض مناسب.',
      timeline: 'لا ينشر الملف المهني مدد تسليم ثابتة. شارك متطلباتك في صفحة التواصل لمناقشة الجدول الزمني.',
      tourWelcome: 'مرحباً بكم في الملف المهني الرسمي لمحمد حمزة، مهندس الذكاء الاصطناعي. استكشف الذكاء الاصطناعي التوليدي، وأنظمة الوكلاء، والرؤية الحاسوبية، وتعلم الآلة. اختر مشروعاً أو اسأل المساعد كيف يمكنني مساعدتك.',
      tourServices: 'استكشف خدمات الذكاء الاصطناعي التوليدي، ووكلاء الذكاء الاصطناعي، والرؤية الحاسوبية، وتعلم الآلة التقليدي، بما في ذلك أنظمة التوليد المعزز بالاسترجاع.',
      tourResume: 'افتح السيرة الذاتية التقنية للاطلاع على خبرة محمد حمزة ومهاراته وأبحاثه.',
      tourProjects: 'انتقل إلى المشاريع لاستكشاف أعمال هندسية مختارة.',
      tourContact: 'استخدم صفحة التواصل لمناقشة مشروعك واختر لغتك المفضلة. كيف يمكنني مساعدتك؟',
      showGuide: 'إظهار دليل الملف المهني', closeQuestions: 'إغلاق الأسئلة', source: 'عرض الخدمة', clear: 'مسح', muted: 'الصوت متوقف',
      serviceList: 'تشمل الخدمات المنشورة نماذج اللغة والذكاء الاصطناعي التوليدي، وRAG، والوكلاء، والرؤية الحاسوبية، ومعالجة اللغة، وتطبيقات الويب، والأبحاث، وعلوم البيانات، وMLOps. ما الخدمة التي تهمك؟',
      contactAnswer: 'شارك متطلبات مشروعك عبر صفحة التواصل أو أرسل بريداً إلى hamza.ai.official@gmail.com. يطلب النموذج اسمك وبريدك وموضوع الرسالة ونصها.',
      resumeAnswer: 'تتضمن السيرة الذاتية التقنية خبرة محمد حمزة ومهاراته وأبحاثه. افتح السيرة للاطلاع عليها.',
      projectsAnswer: 'افتح المشاريع للاطلاع على أعمال هندسية مختارة لمحمد حمزة.'
    }
  };

  Object.assign(ui.en, { assistant: 'AI assistant', searchLanguage: 'Search languages', searchLanguagePlaceholder: 'Search language or name…', openAssistant: 'Open assistant', closeAssistant: 'Close assistant', welcomeTitle: 'Meet Muhammad Hamza', enterPortfolio: 'Enter portfolio', skipIntro: 'Skip introduction', exploreAI: 'Explore the engineering behind intelligent systems.', entryHint: 'Click to enter · Move to explore', entryTitle: 'Muhammad Hamza', entrySubtitle: 'AI Engineer', agents: 'Agentic AI', vision: 'Computer Vision', generative: 'Generative AI', classicalLabel: 'Classical ML' });
  Object.assign(ui.ur, { assistant: 'اے آئی اسسٹنٹ', searchLanguage: 'زبان تلاش کریں', searchLanguagePlaceholder: 'زبان یا نام تلاش کریں…', openAssistant: 'اسسٹنٹ کھولیں', closeAssistant: 'اسسٹنٹ بند کریں', welcomeTitle: 'محمد حمزہ سے ملیں', enterPortfolio: 'پورٹ فولیو میں داخل ہوں', skipIntro: 'تعارف چھوڑیں', exploreAI: 'ذہین سسٹمز کے پیچھے انجینئرنگ دیکھیں۔', entryHint: 'داخل ہونے کے لیے کلک کریں · دریافت کے لیے حرکت کریں', entryTitle: 'Muhammad Hamza', entrySubtitle: 'اے آئی انجینئر', agents: 'ایجنٹک اے آئی', vision: 'کمپیوٹر وژن', generative: 'جنریٹو اے آئی', classicalLabel: 'کلاسیکل مشین لرننگ' });
  Object.assign(ui.ar, { assistant: 'مساعد الذكاء الاصطناعي', searchLanguage: 'البحث عن لغة', searchLanguagePlaceholder: 'ابحث عن لغة أو اسم…', openAssistant: 'فتح المساعد', closeAssistant: 'إغلاق المساعد', welcomeTitle: 'تعرّف على محمد حمزة', enterPortfolio: 'ادخل إلى الملف المهني', skipIntro: 'تجاوز المقدمة', exploreAI: 'استكشف الهندسة وراء الأنظمة الذكية.', entryHint: 'انقر للدخول · تحرّك للاستكشاف', entryTitle: 'Muhammad Hamza', entrySubtitle: 'مهندس الذكاء الاصطناعي', agents: 'الذكاء الاصطناعي الوكيلي', vision: 'الرؤية الحاسوبية', generative: 'الذكاء الاصطناعي التوليدي', classicalLabel: 'تعلم الآلة التقليدي' });
  Object.assign(ui.en, { showMeAround: 'Show me around', noLanguages: 'No matching languages' });
  Object.assign(ui.ur, { showMeAround: 'رہنمائی کریں', noLanguages: 'کوئی زبان نہیں ملی' });
  Object.assign(ui.ar, { showMeAround: 'عرّفني على الموقع', noLanguages: 'لا توجد لغات مطابقة' });

  // Each entry is the published English copy followed by Urdu and Arabic.
  // Translations touch text nodes only, so links, icons and form state survive.
  var copy = [
    ['Professional AI Development Services', 'پیشہ ورانہ اے آئی ڈیولپمنٹ خدمات', 'خدمات تطوير الذكاء الاصطناعي الاحترافية'],
    ["I build intelligent, scalable AI systems for startups and enterprises worldwide — agentic multi-agent workflows, production RAG pipelines, and computer vision, deployed with proper cloud and DevOps practice. Let's turn your AI idea into reality.", 'میں دنیا بھر کے اسٹارٹ اپس اور اداروں کے لیے ذہین اور قابل توسیع اے آئی سسٹمز بناتا ہوں، جن میں ملٹی ایجنٹ ورک فلوز، پروڈکشن RAG پائپ لائنز اور کمپیوٹر وژن شامل ہیں۔ انہیں کلاؤڈ اور DevOps کے مناسب طریقوں سے تعینات کیا جاتا ہے۔ آئیے آپ کے اے آئی خیال کو حقیقت بنائیں۔', 'أطوّر أنظمة ذكاء اصطناعي ذكية وقابلة للتوسع للشركات الناشئة والمؤسسات حول العالم، تشمل سير عمل متعدد الوكلاء وخطوط RAG للإنتاج والرؤية الحاسوبية، مع النشر وفق ممارسات السحابة وDevOps. لنحوّل فكرتك إلى واقع.'],
    ['Hire Me', 'میری خدمات حاصل کریں', 'استعن بخدماتي'], ['View Portfolio', 'پورٹ فولیو دیکھیں', 'عرض الأعمال'],
    ['What I Offer', 'میری خدمات', 'الخدمات التي أقدّمها'],
    ['Available for Hire Worldwide', 'دنیا بھر میں کام کے لیے دستیاب', 'متاح للعمل حول العالم'],
    ['Published: Elsevier Q1 (2025)', 'اشاعت: Elsevier Q1 (2025)', 'نُشر في Elsevier Q1 (2025)'],
    ['Tool Orchestration', 'ٹولز کی ترتیب و انتظام', 'تنسيق الأدوات'],
    ['Why Hire Me?', 'میری خدمات کیوں حاصل کریں؟', 'لماذا تختارني؟'],
    ['Published Researcher', 'شائع شدہ تحقیق کے مصنف', 'باحث له أبحاث منشورة'],
    ['Research published in Elsevier Q1 journal (Ain Shams Engineering Journal, 2025). Deep academic AI background.', 'تحقیق Elsevier کے Q1 جریدے (Ain Shams Engineering Journal، 2025) میں شائع ہوئی۔ اے آئی میں مضبوط تعلیمی پس منظر۔', 'بحث منشور في مجلة Elsevier المصنفة Q1، وهي Ain Shams Engineering Journal، عام 2025. خلفية أكاديمية عميقة في الذكاء الاصطناعي.'],
    ['International Experience', 'بین الاقوامی تجربہ', 'خبرة دولية'],
    ['Delivered AI projects for clients in US, UK, Australia, Germany and more. Fluent in remote collaboration.', 'امریکہ، برطانیہ، آسٹریلیا، جرمنی اور دیگر ممالک کے کلائنٹس کے لیے اے آئی پراجیکٹس مکمل کیے۔ ریموٹ تعاون کا تجربہ۔', 'نفّذت مشاريع ذكاء اصطناعي لعملاء في الولايات المتحدة وبريطانيا وأستراليا وألمانيا وغيرها، مع خبرة في التعاون عن بُعد.'],
    ['Production-Ready AI', 'پروڈکشن کے لیے تیار اے آئی', 'ذكاء اصطناعي جاهز للإنتاج'],
    ['Not just prototypes — I build scalable, production-grade AI systems with proper testing, deployment and monitoring.', 'میں مناسب ٹیسٹنگ، ڈیپلائمنٹ اور نگرانی کے ساتھ قابل توسیع، پروڈکشن معیار کے اے آئی سسٹمز بناتا ہوں۔', 'أطوّر أنظمة ذكاء اصطناعي قابلة للتوسع بمستوى إنتاجي، مع الاختبار والنشر والمراقبة المناسبة.'],
    ['5-Star Reviews', 'پانچ ستاروں والے تبصرے', 'تقييمات خمس نجوم'],
    ['Top-rated on Fiverr with 5-star reviews from international clients for ML, AI and Python development projects.', 'مشین لرننگ، اے آئی اور Python پراجیکٹس کے لیے بین الاقوامی کلائنٹس سے Fiverr پر پانچ ستاروں والے تبصرے۔', 'تقييمات مرتفعة على Fiverr وخمس نجوم من عملاء دوليين لمشاريع تعلم الآلة والذكاء الاصطناعي وPython.'],
    ['How I Work', 'میرے کام کا طریقہ', 'كيف أعمل'],
    ['Discovery Call', 'ابتدائی گفتگو', 'مكالمة استكشافية'],
    ['We discuss your project requirements, goals, timeline, and technical constraints to understand what you need.', 'ہم آپ کی ضروریات سمجھنے کے لیے پراجیکٹ کی ضروریات، مقاصد، وقت اور تکنیکی حدود پر بات کرتے ہیں۔', 'نناقش متطلبات مشروعك وأهدافه وجدوله الزمني وقيوده التقنية لفهم احتياجاتك.'],
    ['Proposal & Planning', 'تجویز اور منصوبہ بندی', 'العرض والتخطيط'],
    ['I provide a detailed technical proposal with architecture, timeline, milestones and pricing tailored to your project.', 'میں آپ کے پراجیکٹ کے مطابق آرکیٹیکچر، شیڈول، مراحل اور قیمت کے ساتھ تفصیلی تکنیکی تجویز دیتا ہوں۔', 'أقدّم عرضاً تقنياً مفصلاً يتضمن البنية والجدول والمراحل والتسعير المناسب لمشروعك.'],
    ['Development & Delivery', 'ڈیولپمنٹ اور فراہمی', 'التطوير والتسليم'],
    ['Agile development with regular updates, demos, and checkpoints. Clean, documented code delivered on schedule.', 'باقاعدہ اپ ڈیٹس، ڈیموز اور جائزوں کے ساتھ ایجائل ڈیولپمنٹ۔ واضح اور دستاویزی کوڈ مقررہ شیڈول کے مطابق فراہم کیا جاتا ہے۔', 'تطوير مرن مع تحديثات وعروض ومراجعات منتظمة، وتسليم شيفرة واضحة وموثّقة وفق الجدول المتفق عليه.'],
    ['Support & Maintenance', 'سپورٹ اور دیکھ بھال', 'الدعم والصيانة'],
    ['Post-delivery support, bug fixes, and ongoing maintenance to ensure your AI system runs perfectly.', 'فراہمی کے بعد سپورٹ، خرابیوں کی اصلاح اور مسلسل دیکھ بھال تاکہ آپ کا اے آئی سسٹم درست کام کرے۔', 'دعم بعد التسليم وإصلاح الأخطاء وصيانة مستمرة لضمان تشغيل نظام الذكاء الاصطناعي بصورة سليمة.'],
    ['Ready to Build Your AI Solution?', 'اپنا اے آئی حل بنانے کے لیے تیار ہیں؟', 'هل أنت مستعد لبناء حل الذكاء الاصطناعي؟'],
    ["Let's discuss your AI project. I'm available for freelance, contract, and full-time remote positions worldwide.", 'آئیے آپ کے اے آئی پراجیکٹ پر بات کریں۔ میں دنیا بھر میں فری لانس، معاہدے اور مکمل وقت کی ریموٹ ملازمت کے لیے دستیاب ہوں۔', 'لنناقش مشروعك. أنا متاح للعمل الحر والتعاقد والوظائف عن بُعد بدوام كامل حول العالم.'],
    ['Contact Muhammad Hamza', 'محمد حمزہ سے رابطہ کریں', 'تواصل مع محمد حمزة'],
    ['Want to get connected? Follow me on the social channels below.', 'رابطے میں رہنا چاہتے ہیں؟ نیچے دیے گئے سوشل پلیٹ فارمز پر مجھے فالو کریں۔', 'هل ترغب في التواصل؟ تابعني عبر القنوات الاجتماعية أدناه.'],
    ['You can fill in the contact form below or send me an email to', 'آپ نیچے رابطہ فارم پُر کر سکتے ہیں یا اس پتے پر ای میل بھیج سکتے ہیں:', 'يمكنك تعبئة نموذج التواصل أدناه أو إرسال بريد إلكتروني إلى'],
    ['Contact Me', 'مجھ سے رابطہ کریں', 'تواصل معي'],
    ['Interested in collaborating or have a question? Feel free to reach out!', 'تعاون کرنا چاہتے ہیں یا کوئی سوال ہے؟ بلا جھجک رابطہ کریں!', 'هل ترغب في التعاون أو لديك سؤال؟ يسعدني تواصلك!'],
    ['Message sent successfully.', 'پیغام کامیابی سے بھیج دیا گیا۔', 'تم إرسال الرسالة بنجاح.'],
    ['Thank you — I will reply as soon as possible.', 'شکریہ، میں جلد از جلد جواب دوں گا۔', 'شكراً لك، سأرد في أقرب وقت ممكن.'],
    ['Your name', 'آپ کا نام', 'اسمك'], ['Your Name', 'آپ کا نام', 'اسمك'],
    ['Your email', 'آپ کی ای میل', 'بريدك الإلكتروني'], ['Your Email', 'آپ کی ای میل', 'بريدك الإلكتروني'],
    ['Subject', 'موضوع', 'الموضوع'], ['Your message', 'آپ کا پیغام', 'رسالتك'], ['Your Message', 'آپ کا پیغام', 'رسالتك'],
    ['Send Message', 'پیغام بھیجیں', 'إرسال الرسالة'],
    ['Protected by spam filtering. Your details are used only to reply to this enquiry.', 'اسپیم فلٹرنگ سے محفوظ۔ آپ کی معلومات صرف اس سوال کا جواب دینے کے لیے استعمال ہوتی ہیں۔', 'محمي بفلترة الرسائل المزعجة. تُستخدم بياناتك فقط للرد على هذا الاستفسار.'],
    ['Chat on WhatsApp', 'واٹس ایپ پر گفتگو کریں', 'تحدث عبر واتساب'],
    ['Message Muhammad Hamza on WhatsApp', 'محمد حمزہ کو واٹس ایپ پر پیغام بھیجیں', 'راسل محمد حمزة عبر واتساب'],
    ['Home', 'ہوم', 'الرئيسية'], ['Portfolio', 'پورٹ فولیو', 'الأعمال'], ['Services', 'خدمات', 'الخدمات'], ['Contact', 'رابطہ', 'التواصل'],
    ['Muhammad Hamza', 'محمد حمزہ', 'محمد حمزة'],
    ['— AI Engineer | Python Engineer | Research Author', '— اے آئی انجینئر | Python انجینئر | محقق', '— مهندس ذكاء اصطناعي | مهندس Python | باحث'],
    ['© 2023 Muhammad Hamza  — Python Developer | Research Author', '© 2025 محمد حمزہ — Python ڈیولپر | محقق', '© 2025 محمد حمزة — مطور Python | باحث'],
    ['Services Hero', 'خدمات کا تعارف', 'مقدمة الخدمات'], ['All Services', 'تمام خدمات', 'جميع الخدمات'],
    ['Why Hire Muhammad Hamza', 'محمد حمزہ کی خدمات کیوں حاصل کریں', 'لماذا تختار محمد حمزة'], ['Work Process', 'کام کا طریقہ', 'مراحل العمل'], ['Call to Action', 'رابطے کی دعوت', 'دعوة للتواصل']
  ];

  var serviceData = [
    { id: 'llm', keywords: ['llm', 'gpt', 'generative', 'fine tun', 'finetun', 'chatbot', 'prompt', 'ollama', 'language model', 'چیٹ بوٹ', 'زبان کا ماڈل', 'جنریٹو', 'نماذج اللغة', 'نموذج لغوي', 'توليدي', 'روبوت محادثة'], rows: [
      ['LLM & Generative AI Development', 'LLM اور جنریٹو اے آئی ڈیولپمنٹ', 'تطوير نماذج اللغة والذكاء الاصطناعي التوليدي'],
      ['Custom large language model solutions powered by the latest AI technology for your business use case.', 'آپ کی کاروباری ضروریات کے لیے جدید اے آئی ٹیکنالوجی پر مبنی زبان کے بڑے ماڈلز کے حسب ضرورت حل۔', 'حلول مخصصة لنماذج اللغة الكبيرة باستخدام تقنيات الذكاء الاصطناعي الحديثة لتلبية احتياجات عملك.'],
      ['ChatGPT / GPT-4 / GPT-4o API integration', 'ChatGPT / GPT-4 / GPT-4o API انٹیگریشن', 'دمج واجهات ChatGPT / GPT-4 / GPT-4o'],
      ['Custom LLM fine-tuning (LoRA, PEFT)', 'LLM کی حسب ضرورت فائن ٹیوننگ (LoRA، PEFT)', 'ضبط نماذج اللغة المخصصة باستخدام LoRA وPEFT'],
      ['Prompt engineering & optimization', 'پرومپٹ انجینئرنگ اور بہتری', 'هندسة التعليمات وتحسينها'],
      ['Multi-turn conversation systems', 'کئی مراحل پر مشتمل گفتگو کے سسٹمز', 'أنظمة محادثة متعددة الأدوار'],
      ['LLM evaluation & benchmarking', 'LLM کی جانچ اور بینچ مارکنگ', 'تقييم نماذج اللغة ومقارنتها'],
      ['Ollama & open-source LLM deployment', 'Ollama اور اوپن سورس LLM کی ڈیپلائمنٹ', 'نشر Ollama ونماذج اللغة مفتوحة المصدر']
    ] },
    { id: 'rag', keywords: ['rag', 'retrieval', 'vector', 'knowledge base', 'document', 'pinecone', 'chroma', 'faiss', 'semantic search', 'دستاویز', 'بازیافت', 'نالج بیس', 'مستند', 'وثائق', 'استرجاع', 'قاعدة معرفة'], rows: [
      ['RAG Pipeline Development', 'RAG پائپ لائن ڈیولپمنٹ', 'تطوير خطوط RAG'],
      ['Retrieval-Augmented Generation systems that let your AI answer questions from your own documents, databases, and knowledge bases.', 'Retrieval-Augmented Generation سسٹمز جو آپ کے اے آئی کو آپ کی اپنی دستاویزات، ڈیٹابیسز اور معلوماتی ذخائر سے سوالات کے جواب دینے کے قابل بناتے ہیں۔', 'أنظمة التوليد المعزز بالاسترجاع التي تتيح للذكاء الاصطناعي الإجابة من مستنداتك وقواعد بياناتك ومصادر المعرفة الخاصة بك.'],
      ['Document ingestion & chunking pipelines', 'دستاویزات کی درآمد اور حصوں میں تقسیم کی پائپ لائنز', 'خطوط إدخال المستندات وتقسيمها'],
      ['Vector database setup (Pinecone, Chroma, Weaviate)', 'ویکٹر ڈیٹابیس سیٹ اپ (Pinecone، Chroma، Weaviate)', 'إعداد قواعد بيانات المتجهات (Pinecone، Chroma، Weaviate)'],
      ['Semantic search & hybrid retrieval', 'معنوی تلاش اور ہائبرڈ بازیافت', 'البحث الدلالي والاسترجاع الهجين'],
      ['Multi-document Q&A systems', 'متعدد دستاویزات سے سوال و جواب کے سسٹمز', 'أنظمة أسئلة وأجوبة عبر مستندات متعددة'],
      ['RAG evaluation & optimization', 'RAG کی جانچ اور بہتری', 'تقييم RAG وتحسينه'],
      ['Enterprise knowledge base chatbots', 'اداروں کے معلوماتی ذخائر پر مبنی چیٹ بوٹس', 'روبوتات محادثة لقواعد المعرفة المؤسسية']
    ] },
    { id: 'agentic', keywords: ['agent', 'langgraph', 'mcp', 'automation', 'autonomous', 'workflow', 'ایجنٹ', 'خودکار', 'خود مختار', 'وكلاء', 'وكيل', 'أتمتة', 'سير العمل'], rows: [
      ['Agentic AI & Multi-Agent Systems', 'ایجنٹک اے آئی اور ملٹی ایجنٹ سسٹمز', 'الذكاء الاصطناعي الوكيلي والأنظمة متعددة الوكلاء'],
      ['Autonomous AI agents that reason, plan, and take actions to complete complex multi-step tasks — with agent state, tool orchestration and context handling built in.', 'خود مختار اے آئی ایجنٹس جو پیچیدہ کئی مرحلوں والے کام مکمل کرنے کے لیے استدلال، منصوبہ بندی اور عمل کرتے ہیں، ساتھ ایجنٹ اسٹیٹ، ٹولز کا انتظام اور سیاق سنبھالنے کی سہولت۔', 'وكلاء ذكاء اصطناعي مستقلون يستدلون ويخططون وينفّذون مهام معقدة متعددة الخطوات، مع إدارة حالة الوكيل وتنسيق الأدوات والسياق.'],
      ['AI agent design & architecture', 'اے آئی ایجنٹ کا ڈیزائن اور آرکیٹیکچر', 'تصميم وكلاء الذكاء الاصطناعي وبنيتهم'],
      ['LangGraph multi-agent orchestration (state machines, tool use)', 'LangGraph ملٹی ایجنٹ انتظام (اسٹیٹ مشینز، ٹولز کا استعمال)', 'تنسيق وكلاء متعددين باستخدام LangGraph (آلات الحالة واستخدام الأدوات)'],
      ['Model Context Protocol (MCP) integration', 'Model Context Protocol (MCP) انٹیگریشن', 'دمج بروتوكول سياق النموذج (MCP)'],
      ['Tool-using agents (retrieval, web search, code exec)', 'ٹولز استعمال کرنے والے ایجنٹس (بازیافت، ویب تلاش، کوڈ چلانا)', 'وكلاء يستخدمون أدوات الاسترجاع وبحث الويب وتنفيذ الشيفرة'],
      ['Persistent session memory & contextual state', 'مستقل سیشن میموری اور سیاقی اسٹیٹ', 'ذاكرة جلسة مستمرة وحالة سياقية'],
      ['Business process automation', 'کاروباری عمل کی خودکاری', 'أتمتة العمليات التجارية']
    ] },
    { id: 'cv', keywords: ['cv', 'computer vision', 'image', 'video', 'cctv', 'camera', 'yolo', 'opencv', 'object detection', 'face recognition', 'facial recognition', 'image recognition', 'defect detection', 'visual inspection', 'segmentation', 'تصویر', 'ویڈیو', 'وژن', 'شناخت', 'رؤية حاسوبية', 'صور', 'صورة', 'فيديو', 'كشف', 'تعرف'], rows: [
      ['Computer Vision Solutions', 'کمپیوٹر وژن حل', 'حلول الرؤية الحاسوبية'],
      ['Advanced image and video AI systems for object detection, classification, segmentation and visual inspection.', 'آبجیکٹ ڈیٹیکشن، درجہ بندی، سیگمنٹیشن اور بصری معائنے کے لیے جدید تصویری اور ویڈیو اے آئی سسٹمز۔', 'أنظمة ذكاء اصطناعي متقدمة للصور والفيديو لكشف الأجسام وتصنيفها وتقسيم الصور والفحص البصري.'],
      ['Object detection (YOLOv8, Faster R-CNN)', 'آبجیکٹ ڈیٹیکشن (YOLOv8، Faster R-CNN)', 'كشف الأجسام باستخدام YOLOv8 وFaster R-CNN'],
      ['Image classification & recognition', 'تصاویر کی درجہ بندی اور شناخت', 'تصنيف الصور والتعرف عليها'],
      ['Medical image analysis (MRI, CT, X-ray)', 'طبی تصاویر کا تجزیہ (MRI، CT، ایکسرے)', 'تحليل الصور الطبية (MRI وCT والأشعة السينية)'],
      ['Real-time video analytics', 'فوری ویڈیو تجزیہ', 'تحليلات الفيديو في الوقت الفعلي'],
      ['Quality control & defect detection', 'معیار کا کنٹرول اور نقائص کی شناخت', 'ضبط الجودة وكشف العيوب'],
      ['Facial recognition systems', 'چہرے کی شناخت کے سسٹمز', 'أنظمة التعرف على الوجوه']
    ] },
    { id: 'nlp', keywords: ['nlp', 'sentiment', 'text', 'translation', 'ner', 'summari', 'bert', 'spacy', 'ترجم', 'متن', 'جذبات', 'معالجة اللغة', 'نصوص', 'نص', 'ترجم', 'مشاعر', 'تلخيص'], rows: [
      ['NLP & Text Analytics', 'NLP اور متن کا تجزیہ', 'معالجة اللغة الطبيعية وتحليل النصوص'],
      ['Natural language processing systems that understand, classify, and extract insights from text data at scale.', 'قدرتی زبان کی پروسیسنگ کے سسٹمز جو بڑے پیمانے پر متنی ڈیٹا کو سمجھتے، درجہ بندی کرتے اور معلومات اخذ کرتے ہیں۔', 'أنظمة معالجة اللغة الطبيعية التي تفهم البيانات النصية وتصنّفها وتستخرج منها رؤى على نطاق واسع.'],
      ['Sentiment analysis systems', 'جذبات کے تجزیے کے سسٹمز', 'أنظمة تحليل المشاعر'],
      ['Text classification & categorization', 'متن کی درجہ بندی اور زمرہ بندی', 'تصنيف النصوص وتبويبها'],
      ['Named entity recognition (NER)', 'نام زد ہستیوں کی شناخت (NER)', 'التعرف على الكيانات المسماة (NER)'],
      ['Information extraction pipelines', 'معلومات اخذ کرنے کی پائپ لائنز', 'خطوط استخراج المعلومات'],
      ['Text summarization', 'متن کا خلاصہ', 'تلخيص النصوص'],
      ['Language translation systems', 'زبانوں کے ترجمے کے سسٹمز', 'أنظمة ترجمة اللغات']
    ] },
    { id: 'webdev', keywords: ['web', 'django', 'saas', 'website', 'full stack', 'fullstack', 'dashboard', 'ویب', 'ڈیش بورڈ', 'موقع', 'ويب', 'لوحات', 'تطبيق'], rows: [
      ['AI-Powered Web Development', 'اے آئی پر مبنی ویب ڈیولپمنٹ', 'تطوير الويب المدعوم بالذكاء الاصطناعي'],
      ['Full-stack web applications with integrated AI capabilities, built with Django and modern front-end technologies.', 'Django اور جدید فرنٹ اینڈ ٹیکنالوجیز سے تیار کردہ فل اسٹیک ویب ایپلی کیشنز، جن میں اے آئی کی سہولیات شامل ہوں۔', 'تطبيقات ويب متكاملة بقدرات ذكاء اصطناعي، مبنية باستخدام Django وتقنيات واجهات حديثة.'],
      ['Django REST API with AI integration', 'اے آئی انٹیگریشن کے ساتھ Django REST API', 'واجهات Django REST API مع دمج الذكاء الاصطناعي'],
      ['AI chatbot web applications', 'اے آئی چیٹ بوٹ ویب ایپلی کیشنز', 'تطبيقات ويب لروبوتات محادثة ذكية'],
      ['Real-time AI dashboards & analytics', 'فوری اے آئی ڈیش بورڈز اور تجزیات', 'لوحات ذكاء اصطناعي وتحليلات في الوقت الفعلي'],
      ['AI SaaS platform development', 'اے آئی SaaS پلیٹ فارم کی ڈیولپمنٹ', 'تطوير منصات AI SaaS'],
      ['Database design & optimization', 'ڈیٹابیس ڈیزائن اور بہتری', 'تصميم قواعد البيانات وتحسينها'],
      ['Cloud deployment (AWS, GCP, Heroku)', 'کلاؤڈ ڈیپلائمنٹ (AWS، GCP، Heroku)', 'النشر السحابي على AWS وGCP وHeroku']
    ] },
    { id: 'research', keywords: ['research', 'publication', 'thesis', 'phd', 'ph.d', 'manuscript', 'elsevier', 'تحقیق', 'مقال', 'اشاعت', 'بحث', 'أبحاث', 'رسالة', 'نشر', 'دكتوراه'], rows: [
      ['AI Research & Publications', 'اے آئی تحقیق اور اشاعتیں', 'أبحاث الذكاء الاصطناعي والمنشورات'],
      ['Academic AI research services for Masters and Ph.D. students. Published research author in Elsevier (Q1 journal).', 'ماسٹرز اور پی ایچ ڈی طلبہ کے لیے علمی اے آئی تحقیق کی خدمات۔ Elsevier کے Q1 جریدے میں شائع شدہ تحقیق کے مصنف۔', 'خدمات أبحاث أكاديمية في الذكاء الاصطناعي لطلاب الماجستير والدكتوراه، من باحث له منشور في مجلة Elsevier المصنفة Q1.'],
      ['Research proposal & methodology', 'تحقیقی تجویز اور طریقۂ کار', 'مقترح البحث ومنهجيته'],
      ['Deep learning model design', 'ڈیپ لرننگ ماڈل کا ڈیزائن', 'تصميم نماذج التعلم العميق'],
      ['Medical imaging AI research', 'طبی امیجنگ میں اے آئی تحقیق', 'أبحاث الذكاء الاصطناعي للتصوير الطبي'],
      ['Anomaly detection research', 'غیر معمولی حالتوں کی شناخت کی تحقیق', 'أبحاث كشف الحالات الشاذة'],
      ['Manuscript writing & editing', 'تحقیقی مسودے کی تحریر اور تدوین', 'كتابة المخطوطات البحثية وتحريرها'],
      ['Data collection & preprocessing', 'ڈیٹا جمع کرنا اور ابتدائی تیاری', 'جمع البيانات ومعالجتها الأولية']
    ] },
    { id: 'data', keywords: ['data science', 'data analysis', 'analytics', 'predict', 'forecast', 'machine learning', 'ml', 'pandas', 'eda', 'ڈیٹا', 'پیش گوئی', 'مشین لرننگ', 'علوم البيانات', 'تحليل البيانات', 'تحليلات', 'تنبؤ', 'تعلم الآلة'], rows: [
      ['Data Science & Analytics', 'ڈیٹا سائنس اور تجزیات', 'علوم البيانات والتحليلات'],
      ['End-to-end data science solutions from raw data processing to predictive models and business intelligence dashboards.', 'خام ڈیٹا کی پروسیسنگ سے پیش گوئی کے ماڈلز اور کاروباری معلومات کے ڈیش بورڈز تک مکمل ڈیٹا سائنس حل۔', 'حلول علوم بيانات متكاملة، من معالجة البيانات الخام إلى النماذج التنبؤية ولوحات ذكاء الأعمال.'],
      ['Data cleaning & preprocessing', 'ڈیٹا کی صفائی اور ابتدائی تیاری', 'تنظيف البيانات ومعالجتها الأولية'],
      ['Exploratory data analysis (EDA)', 'ڈیٹا کا ابتدائی تحقیقی تجزیہ (EDA)', 'التحليل الاستكشافي للبيانات (EDA)'],
      ['Predictive modeling & forecasting', 'پیش گوئی کے ماڈلز اور اندازے', 'النمذجة التنبؤية والتوقعات'],
      ['Feature engineering & selection', 'فیچر انجینئرنگ اور انتخاب', 'هندسة الخصائص واختيارها'],
      ['Interactive dashboards', 'انٹرایکٹو ڈیش بورڈز', 'لوحات معلومات تفاعلية'],
      ['ML model deployment', 'مشین لرننگ ماڈل کی ڈیپلائمنٹ', 'نشر نماذج تعلم الآلة']
    ] },
    { id: 'devops', keywords: ['deploy', 'mlops', 'devops', 'docker', 'kubernetes', 'cloud', 'aws', 'ci/cd', 'retraining', 'hosting', 'ڈیپلائمنٹ', 'کلاؤڈ', 'تعینات', 'نشر', 'سحابة', 'سحابي', 'استضافة'], rows: [
      ['MLOps, Cloud & DevOps', 'MLOps، کلاؤڈ اور DevOps', 'MLOps والسحابة وDevOps'],
      ['Production deployment and CI/CD for AI systems — from containerized services to automated testing and release pipelines.', 'اے آئی سسٹمز کے لیے پروڈکشن ڈیپلائمنٹ اور CI/CD، کنٹینر سروسز سے خودکار ٹیسٹنگ اور ریلیز پائپ لائنز تک۔', 'نشر إنتاجي وCI/CD لأنظمة الذكاء الاصطناعي، من الخدمات ضمن الحاويات إلى الاختبارات الآلية وخطوط الإصدار.'],
      ['Docker containerization for AI/ML services', 'AI/ML سروسز کے لیے Docker کنٹینرز', 'حاويات Docker لخدمات الذكاء الاصطناعي وتعلم الآلة'],
      ['Kubernetes orchestration & scaling', 'Kubernetes کا انتظام اور توسیع', 'تنسيق Kubernetes وتوسيع الأنظمة'],
      ['CI/CD pipelines (GitHub Actions, Jenkins)', 'CI/CD پائپ لائنز (GitHub Actions، Jenkins)', 'خطوط CI/CD باستخدام GitHub Actions وJenkins'],
      ['AWS cloud deployment', 'AWS کلاؤڈ ڈیپلائمنٹ', 'النشر السحابي على AWS'],
      ['Automated model retraining & testing', 'ماڈل کی خودکار دوبارہ تربیت اور ٹیسٹنگ', 'إعادة تدريب النماذج واختبارها آلياً'],
      ['API testing & documentation (Postman)', 'API ٹیسٹنگ اور دستاویزات (Postman)', 'اختبار واجهات API وتوثيقها باستخدام Postman']
    ] }
  ];

  serviceData.forEach(function (service) { copy = copy.concat(service.rows); });
  var translations = Object.create(null);
  copy.forEach(function (row) { translations[row[0]] = { ur: row[1], ar: row[2] }; });
  var textRecords = [];
  var attributeRecords = [];
  var textLookup = new WeakMap();
  var attributeLookup = new WeakMap();
  var pageCopies = Object.create(null);
  var reversePageCopies = Object.create(null);
  var pageLoads = Object.create(null);
  var languageRequest = 0;
  var languageReady = Promise.resolve(true);
  var main = null;
  var header = null;
  var nameGradientHeadings = [];
  var initialized = false;
  var pageKey = /\/projects\//i.test(location.pathname) ? 'project-' + location.pathname.split('/').pop().replace(/\.html$/i, '') : /\/resume\//i.test(location.pathname) ? 'resume' : (location.pathname.split('/').pop() || 'index.html').replace(/\.html$/i, '');
  if (pageKey === 'index') pageKey = 'home';
  var excludedCopy = 'script,style,textarea,pre,code,kbd,samp,svg,math,[translate="no"],[data-name-gradient],.portfolio-language-picker,.portfolio-guide,.portfolio-assistant-dialog,#portfolio-entry,#hero-role-text';
  var copyAttributes = ['placeholder', 'aria-label', 'title', 'alt'];
  var heroRoles = ['production AI systems','LLM & RAG platforms','agentic AI workflows','computer vision intelligence'];
  var heroRoleIndex = 0;

  function t(key) { return ui[language][key] || ui.en[key] || key; }
  function copyKey(text) { return String(text).replace(/\s+/g, ' ').trim(); }
  function translate(text, code) {
    code = code || language;
    var match = translations[copyKey(text)];
    return code === 'en' || !match ? text : match[code] || text;
  }
  function pageReady() { return language === 'en' || pageCopies[language] === true; }
  function pageStatus() { return { page:pageKey, language:language, ready:pageReady() }; }
  function registerPageCopy(code, key, entries) {
    if (key !== pageKey || !languages.some(function (item) { return item.code === code; }) || !entries || typeof entries !== 'object') return false;
    var reverse = Object.create(null);
    Object.keys(entries).forEach(function (original) {
      var translated = entries[original];
      if (typeof translated !== 'string' || !translated.trim()) return;
      var normalized = copyKey(original);
      if (!translations[normalized]) translations[normalized] = Object.create(null);
      translations[normalized][code] = translated;
      if (!reverse[copyKey(translated)]) reverse[copyKey(translated)] = normalized;
    });
    reversePageCopies[code] = reverse;
    pageCopies[code] = true;
    return true;
  }
  function loadPageCopy(code) {
    if (code === 'en' || pageCopies[code]) return Promise.resolve(true);
    if (pageLoads[code]) return pageLoads[code];
    pageLoads[code] = new Promise(function (resolve) {
      var source = document.createElement('script');
      source.async = true;
      source.src = new URL('page-locales/' + encodeURIComponent(pageKey) + '/' + encodeURIComponent(code) + '.js?v=6', scriptUrl).href;
      source.onload = function () { var loaded = pageCopies[code] === true; if (!loaded) delete pageLoads[code]; resolve(loaded); };
      source.onerror = function () { delete pageLoads[code]; source.remove(); resolve(false); };
      document.head.appendChild(source);
    });
    return pageLoads[code];
  }
  function renderNameGradientHeadings(code) {
    nameGradientHeadings.forEach(function (record) {
      var element = record.element;
      if (!element.isConnected) return;
      var translated = translate(record.source, code);
      if (element.textContent === translated && element.querySelector('.hamza-name-gradient')) return;
      var name = 'Muhammad Hamza', index = translated.indexOf(name);
      if (index < 0) { element.textContent = translated; return; }
      var fragment = document.createDocumentFragment();
      fragment.appendChild(document.createTextNode(translated.slice(0,index)));
      var span = document.createElement('span');
      span.className = 'hamza-name-gradient';
      span.textContent = name;
      fragment.appendChild(span);
      fragment.appendChild(document.createTextNode(translated.slice(index + name.length)));
      element.replaceChildren(fragment);
    });
  }
  function translatePage() {
    if (!initialized) return;
    var code = pageReady() ? language : 'en';
    var direction = languages.find(function (item) { return item.code === code; }).dir;
    document.documentElement.lang = code;
    [main,header].forEach(function (element) { if (element) { element.lang = code; element.dir = direction; } });
    textRecords.forEach(function (record) {
      if (!record.node.isConnected) return;
      var translated = translate(record.key, code);
      record.rendered = code === 'en' || translated === record.key ? record.original : record.leading + translated + record.trailing;
      if (record.node.nodeValue !== record.rendered) record.node.nodeValue = record.rendered;
    });
    attributeRecords.forEach(function (record) {
      if (!record.element.isConnected) return;
      record.rendered = code === 'en' ? record.original : translate(record.original, code);
      if (record.element.getAttribute(record.name) !== record.rendered) record.element.setAttribute(record.name, record.rendered);
    });
    renderNameGradientHeadings(code);
    var role = document.getElementById('hero-role-text');
    var roleText = translate(heroRoles[heroRoleIndex],code);
    if (role && role.textContent !== roleText) role.textContent = roleText;
  }
  function activateLanguage(notify) {
    var code = language, token = ++languageRequest;
    function finish(loaded) {
      if (token !== languageRequest || code !== language) return false;
      translatePage();
      document.dispatchEvent(new CustomEvent(notify ? 'portfolio:language' : 'portfolio:pagetranslated', { detail:{ language:code, pageTranslated:loaded } }));
      return loaded;
    }
    if (pageReady()) { finish(true); languageReady = Promise.resolve(true); }
    else {
      translatePage();
      languageReady = loadPageCopy(code).then(finish);
    }
    return languageReady;
  }
  function rememberText(node) {
    if (!node.parentElement || node.parentElement.closest(excludedCopy)) return;
    var original = node.nodeValue, key = copyKey(original);
    if (!key) return;
    var record = textLookup.get(node);
    if (record && record.rendered === original) return;
    if (!record) { record = { node:node }; textLookup.set(node,record); textRecords.push(record); }
    var leading = (original.match(/^\s*/) || [''])[0], trailing = (original.match(/\s*$/) || [''])[0];
    var source = language !== 'en' && reversePageCopies[language] && reversePageCopies[language][key];
    record.original = source ? leading + source + trailing : original; record.key = source || key; record.leading = leading; record.trailing = trailing; record.rendered = original;
  }
  function rememberAttributes(element) {
    if (!element || element.closest(excludedCopy)) return;
    var known = attributeLookup.get(element);
    if (!known) { known = Object.create(null); attributeLookup.set(element,known); }
    copyAttributes.forEach(function (name) {
      var original = element.getAttribute(name), record = known[name];
      if (!original || (record && record.rendered === original)) return;
      if (!record) { record = {element:element,name:name}; known[name] = record; attributeRecords.push(record); }
      var source = language !== 'en' && reversePageCopies[language] && reversePageCopies[language][copyKey(original)];
      record.original = source || original; record.rendered = original;
    });
  }
  function collectCopy(element) {
    if (element.nodeType === Node.TEXT_NODE) { rememberText(element); return; }
    if (element.nodeType !== Node.ELEMENT_NODE || element.closest(excludedCopy)) return;
    rememberAttributes(element);
    var walker = document.createTreeWalker(element,NodeFilter.SHOW_TEXT), node;
    while ((node = walker.nextNode())) rememberText(node);
    Array.prototype.forEach.call(element.querySelectorAll('[placeholder],[aria-label],[title],[alt]'),rememberAttributes);
  }
  function init() {
    if (initialized) return;
    main = document.querySelector('.main-wrapper'); header = document.querySelector('.header');
    nameGradientHeadings = Array.prototype.map.call(document.querySelectorAll('[data-name-gradient]'),function (element) {
      return { element:element, source:copyKey(element.textContent) };
    });
    Object.keys(translations).forEach(function (key) { var normalized = copyKey(key); if (!translations[normalized]) translations[normalized] = translations[key]; });
    var roots = [document.body,document.querySelector('title')].filter(Boolean);
    roots.forEach(collectCopy);
    var email = document.getElementById('contact-email');
    if (email) email.setAttribute('dir','ltr');
    Array.prototype.forEach.call(document.querySelectorAll('a[href^="mailto:"],a[href^="tel:"]'),function (element) { element.setAttribute('dir','ltr'); });
    initialized = true;
    var observer = new MutationObserver(function (changes) {
      var changed = false;
      changes.forEach(function (change) {
        if (change.type === 'characterData') {
          var record = textLookup.get(change.target);
          if (!record || record.rendered !== change.target.nodeValue) { rememberText(change.target); changed = true; }
        } else if (change.type === 'attributes') {
          var known = attributeLookup.get(change.target), attribute = known && known[change.attributeName];
          if (!attribute || attribute.rendered !== change.target.getAttribute(change.attributeName)) { rememberAttributes(change.target); changed = true; }
        } else if (change.addedNodes.length) {
          var count = textRecords.length + attributeRecords.length;
          Array.prototype.forEach.call(change.addedNodes,collectCopy);
          if (textRecords.length + attributeRecords.length !== count) changed = true;
        }
      });
      if (changed) {
        textRecords = textRecords.filter(function (record) { return record.node.isConnected; });
        attributeRecords = attributeRecords.filter(function (record) { return record.element.isConnected; });
        translatePage();
      }
    });
    roots.forEach(function (element) { observer.observe(element,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:copyAttributes}); });
    activateLanguage(false);
    if (document.getElementById('hero-role-text')) window.setInterval(function () {
      if (document.hidden || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      heroRoleIndex = (heroRoleIndex + 1) % heroRoles.length;
      var role = document.getElementById('hero-role-text');
      var text = translate(heroRoles[heroRoleIndex],pageReady() ? language : 'en');
      if (role && role.textContent !== text) role.textContent = text;
    },4000);
  }
  function setLanguage(code) {
    if (!languages.some(function (item) { return item.code === code; })) return false;
    language = code;
    savedLanguage = code;
    try { sessionStorage.setItem('portfolio-language', code); } catch (_) { /* Optional persistence. */ }
    document.dispatchEvent(new CustomEvent('portfolio:languagechanging', {detail:{language:code}}));
    activateLanguage(true);
    return true;
  }

  function normalize(value) {
    return String(value || '').toLowerCase().normalize('NFKC')
      .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
      .replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/[يئ]/g, 'ی').replace(/ك/g, 'ک').trim();
  }
  function contains(question, keyword) {
    var normalized = normalize(keyword);
    var escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match Latin words at a word start: "rate" must not match "generate".
    // Long terms also allow endings such as "agents" and "deployment".
    if (/^[a-z]{1,3}$/.test(normalized)) {
      return new RegExp('(^|[^a-z])' + escaped + '([^a-z]|$)').test(question);
    }
    if (/^\p{Script=Latin}{1,3}$/u.test(normalized)) return new RegExp('(^|[^\\p{L}])' + escaped + '([^\\p{L}]|$)', 'u').test(question);
    if (/^\p{Script=Latin}/u.test(normalized)) return new RegExp('(^|[^\\p{L}])' + escaped, 'u').test(question);
    if (/^\p{Script=Cyrillic}/u.test(normalized)) return new RegExp('(^|[^\\p{L}\\p{M}])' + escaped, 'u').test(question);
    if (/^[\p{Script=Devanagari}\p{Script=Bengali}\p{Script=Tamil}\p{Script=Telugu}]/u.test(normalized)) {
      var letters = Array.from(normalized).filter(function (character) { return /\p{L}/u.test(character); }).length;
      return new RegExp('(^|[^\\p{L}\\p{M}])' + escaped + (letters <= 3 ? '([^\\p{L}\\p{M}]|$)' : ''), 'u').test(question);
    }
    // Short Arabic/Urdu words are separate words, with common Arabic prefixes.
    // This keeps "نص" (text) from matching "منصة" (platform).
    if (/^[\u0600-\u06ff]{1,3}$/.test(normalized)) {
      return new RegExp('(^|[^\\u0600-\\u06ff])(?:ال|لل|بال|ب|ل)?' + escaped + '([^\\u0600-\\u06ff]|$)').test(question);
    }
    return question.indexOf(normalized) !== -1;
  }
  function any(question, terms) { return terms.some(function (term) { return contains(question, term); }); }
  function topicTerms(topic, terms) { return terms.concat((localeKeywords[language] || {})[topic] || []); }
  function serviceTerms(service) { return topicTerms(service.id, service.keywords); }
  function serviceText(service, code) {
    function value(row) { return code === 'en' ? row[0] : (translations[row[0]] || {})[code] || row[0]; }
    return value(service.rows[1]) + ' ' + service.rows.slice(2, 5).map(value).join(code === 'ar' || code === 'ur' || code === 'fa' ? '؛ ' : '; ') + '.';
  }
  function link(label, href) { return { label: label, href: href }; }
  function serviceAnswer(id) {
    var service = serviceData.find(function (item) { return item.id === id; });
    return { text: serviceText(service, language), topic: service.id, links: [link(translate(service.rows[0][0]), 'services.html#' + service.id), link(t('contact'), 'contact.html')] };
  }
  // A compact, hand-checked index of the published case studies. The longer
  // descriptions come from the already translated page-introduction catalog.
  var projectFacts = [
    ['3d-mobibrainnet', '3D-MobiBrainNet', ['mobibrainnet', 'alzheimer classification', '3d brain mri'], ['medical', 'mri', 'alzheimer', 'classification', 'research']],
    ['agentic-cybersecurity-ai-assistant', 'Agentic Cybersecurity AI Assistant', ['cybersecurity assistant', 'vulnerability intelligence', 'vulnerability analysis'], ['agentic', 'security', 'cybersecurity', 'rag', 'vulnerability']],
    ['agentic-rag-support-assistant', 'Agentic RAG-Powered Support Assistant', ['rag support assistant', 'support assistant', 'technical support chatbot'], ['rag', 'support', 'chatbot', 'retrieval', 'agentic']],
    ['ai-intrusion-detection', 'AI-Driven Intrusion Detection', ['intrusion detection', 'tabnet transformer'], ['security', 'cybersecurity', 'network', 'classification', 'intrusion']],
    ['ai-ticket-scalping-prevention', 'AI-Based Ticket Scalping Prevention', ['ticket scalping', 'scalping prevention', 'ticketing fraud'], ['fraud', 'ticketing', 'pricing', 'bots', 'classification']],
    ['ai-virtual-painter', 'AI Virtual Painter', ['virtual painter', 'hand tracking painter', 'air painting'], ['computer vision', 'hand tracking', 'webcam', 'gesture']],
    ['aircraft-engine-rul-prediction', 'Aircraft Engine RUL Prediction AI', ['aircraft engine', 'remaining useful life', 'turbofan'], ['prediction', 'maintenance', 'machine learning', 'sensor']],
    ['attendance-management-system', 'Attendance Management System', ['attendance management', 'shift management', 'workforce platform'], ['flutter', 'attendance', 'hr', 'scheduling']],
    ['drone-flight-simulation', 'AeroNav Sim', ['aeronav', 'drone flight', 'drone simulation'], ['drone', 'uav', 'simulation', 'navigation']],
    ['flood-prediction-lightgbm', 'Flood Prediction with LightGBM', ['flood prediction', 'lightgbm', 'flood model'], ['prediction', 'flood', 'regression', 'machine learning']],
    ['linkedin-automation-bot', 'LinkedIn Automation Bot', ['linkedin automation', 'linkedin bot', 'profile scraping'], ['automation', 'selenium', 'outreach']],
    ['neuroinsight-ai', 'NeuroInsight AI', ['neuroinsight', 'clinical intelligence', 'clinical ai'], ['medical', 'mri', 'alzheimer', 'agentic', 'rag', 'research']],
    ['satellite-image-classification', 'Satellite Image Classification', ['satellite image', 'eurosat', 'land cover'], ['computer vision', 'satellite', 'classification', 'remote sensing']],
    ['university-timetable-system', 'University Timetable System', ['university timetable', 'timetable system', 'faculty scheduling'], ['scheduling', 'django', 'education']],
    ['visionguard-ai', 'VisionGuard AI', ['visionguard', 'warehouse safety', 'forklift pedestrian'], ['computer vision', 'warehouse', 'safety', 'object detection', 'tracking']]
  ];
  var projectTools = {
    '3d-mobibrainnet':'PyTorch, 3D CNN, NiBabel and scikit-learn',
    'agentic-cybersecurity-ai-assistant':'LangChain, LangGraph, FAISS, ChromaDB and Docker',
    'agentic-rag-support-assistant':'LangChain, vector search, embeddings and Python',
    'ai-intrusion-detection':'TabNet, Transformers, Docker and Kubernetes',
    'ai-ticket-scalping-prevention':'scikit-learn, anomaly detection and Python',
    'ai-virtual-painter':'OpenCV, MediaPipe and NumPy',
    'aircraft-engine-rul-prediction':'scikit-learn, XGBoost, LightGBM and NASA C-MAPSS data',
    'attendance-management-system':'Flutter, Dart, Node.js and TypeScript',
    'drone-flight-simulation':'Python, Pygame, ROS, PX4 and MAVROS',
    'flood-prediction-lightgbm':'LightGBM, scikit-learn, Pandas and NumPy',
    'linkedin-automation-bot':'Selenium, BeautifulSoup and Python',
    'neuroinsight-ai':'Flutter, 3D visualization, agentic orchestration and RAG',
    'satellite-image-classification':'PyTorch, transfer-learned ResNet18 and EuroSAT',
    'university-timetable-system':'Django, Python and SQL',
    'visionguard-ai':'YOLO, ByteTrack, OpenCV homography and Python'
  };
  function projectDescription(fact) {
    var catalog = window.PortfolioPageIntros;
    var entry = catalog && catalog['project-' + fact[0]];
    var overview = entry && (entry[language] || entry.en) ? (entry[language] || entry.en).text : fact[1] + '. Open the case study for the overview, methods and results.';
    return language === 'en' && projectTools[fact[0]] ? overview + '\n\nMethods and tools: ' + projectTools[fact[0]] + '.' : overview;
  }
  function projectLink(fact) { return link(fact[1], 'projects/' + fact[0] + '.html'); }
  function factT(key) {
    var words = window.PortfolioKnowledgeLocales && window.PortfolioKnowledgeLocales[language];
    return words && words[key] || key;
  }
  function knowledgeAnswer(query) {
    var contactLink = link(t('contact'), 'contact.html');
    var resumeLink = link(t('resume'), 'resume/index.html');
    if (/^(how are you|how're you|how r u|how is it going|how's it going)[?!. ]*$/.test(query)) {
      return { text: language === 'en' ? "I'm here and ready to help. Ask me about Muhammad Hamza's AI services, projects, or experience." : t('help') + ' ' + t('serviceList'), topic: 'greeting', links: [link(t('services'), 'services.html'), contactLink] };
    }
    var projectIntent = any(query, topicTerms('projects', ['project', 'case study', 'portfolio', 'built', 'work sample', 'پراجیکٹ', 'مشروع', 'proyecto', 'projet', 'projeto']));
    if (any(query, ['whatsapp', 'wa.me', 'whats app', 'واٹس ایپ', 'واتساب', 'watsapp'])) {
      return { text: language === 'en' ? 'Muhammad Hamza’s WhatsApp number is +92 341 7215920. You can also send project details through the Contact page.' : t('contactAnswer') + ' WhatsApp: +92 341 7215920.', topic: 'contact', links: [link('WhatsApp +92 341 7215920', 'https://wa.me/923417215920'), contactLink] };
    }
    if (any(query, ['phone number', 'mobile number', 'telephone number', 'call hamza', 'contact number', 'his number', 'your number', 'hamza number', 'number of hamza', 'فون نمبر', 'رقم الهاتف']) || (query === 'number' || query === 'phone')) {
      return { text: 'Muhammad Hamza’s published WhatsApp number is +92 341 7215920. The Contact page also has a message form.', topic: 'contact', links: [link('WhatsApp +92 341 7215920', 'https://wa.me/923417215920'), contactLink] };
    }
    if (any(query, ['email address', 'email id', 'email hamza', 'ای میل ایڈریس', 'البريد الإلكتروني'])) {
      return { text: 'Muhammad Hamza’s published email address is hamza.ai.official@gmail.com. You can also use the Contact form.', topic: 'contact', links: [link('Email Muhammad Hamza', 'mailto:hamza.ai.official@gmail.com'), contactLink] };
    }
    if (any(query, ['where is hamza based', 'where are you based', 'location', 'where is hamza located', 'city', 'لاہور', 'موقع'])) {
      return { text: 'Muhammad Hamza lists Lahore, Pakistan as his location. For remote work or a project discussion, use the Contact page.', topic: 'contact', links: [resumeLink, contactLink] };
    }
    if (any(query, ['who is muhammad hamza', 'who is hamza', 'about hamza', 'about muhammad', 'your background', 'اپنے بارے', 'من هو محمد'])) {
      return { text: 'Muhammad Hamza is a client-facing AI/ML engineer focused on production-grade agentic AI, RAG, LLM applications, computer vision and machine learning. He leads a four-person development team, works on applied cybersecurity, and has published AI research in medical imaging.', topic: 'about', links: [link(t('about') === 'about' ? 'About Muhammad Hamza' : t('about'), 'index.html#aboutme'), resumeLink] };
    }
    if (any(query, ['why hire', 'hire hamza', 'hire you', 'choose hamza', 'choose you', 'work with hamza', 'آپ کو کیوں', 'کیوں ہائر', 'لماذا أوظف'])) {
      var reasons = language === 'en' ? 'Why hire Muhammad Hamza? He brings published AI research, international client delivery, production-ready engineering from requirements through deployment, and a 4.8/5 Fiverr rating across 13 client reviews.' : factT('Why Hire Me?') + ':\n' + [factT('Published Researcher'),factT('International Experience'),factT('Production-Ready AI'),factT('5-Star Reviews')].join(' · ') + '\n4.8/5 · 13';
      return { text: reasons, topic: 'why-hire', links: [link(factT('Why Hire Me?'), 'services.html#why-hire'), resumeLink, contactLink] };
    }
    if (any(query, ['education', 'degree', 'university of okara', 'cgpa', 'college', 'study', 'studied', 'school', 'qualification', 'alma mater', 'تعلیم', 'پڑھائی', 'جامعة', 'universidad', 'université'])) {
      var education = language === 'en' ? 'Muhammad Hamza earned a BS in Software Engineering from the University of Okara (2020–2024), with a 3.80 CGPA. His earlier qualification is FSc Pre-Engineering from Punjab Group of Colleges.' : factT('Education') + ':\n' + factT('BS Software Engineering, CGPA: 3.80') + ' · University of Okara · 2020–2024\n' + factT('FSc Pre-Engineering') + ' · Punjab Group of Colleges';
      return { text: education, topic: 'education', links: [resumeLink] };
    }
    if (any(query, ['cyberzeus', 'minhaj', 'fiverr', 'work experience', 'career history', 'professional experience', 'employment', 'تجربہ', 'خبرة'])) {
      var experience = language === 'en' ? 'Experience: CyberZeus (Aug 2025–present), first as AI Developer in CyberZeus Games and since Jan 2026 as AI Engineer in CyberZeus Software Systems; Minhaj Solutions (Apr 2024–Aug 2025), AI Developer; and freelance AI/ML and Python work on Fiverr (Jul 2023–present). The résumé details the work in each role.' : factT('Experience') + ':\nCyberZeus · 08/2025 →\nCyberZeus Games · ' + factT('AI Developer') + ' · 08/2025–12/2025\nCyberZeus Software Systems · ' + factT('AI Engineer') + ' · 01/2026 →\nMinhaj Solutions · ' + factT('AI Developer') + ' · 04/2024–08/2025\nFiverr · ' + factT('Freelance AI/ML Engineer & Python Developer') + ' · 07/2023 →';
      return { text: experience, topic: 'experience', links: [resumeLink, contactLink] };
    }
    if (any(query, ['skill', 'tech stack', 'technology stack', 'tools you use', 'programming language', 'مہارت', 'مهارات'])) {
      var skills = language === 'en' ? 'Core skills include Python, FastAPI, LangChain/LangGraph, agent workflows, RAG and vector search (FAISS, ChromaDB, LlamaIndex), machine learning, computer vision (YOLO, OpenCV, ByteTrack), SQL/PostgreSQL, Docker, Kubernetes and AWS. The résumé also lists cybersecurity and VAPT tools.' : factT('Core Technical Skills') + ':\nPython · FastAPI · LangChain · LangGraph · RAG · FAISS · ChromaDB · LlamaIndex · YOLO · OpenCV · ByteTrack · SQL · PostgreSQL · Docker · Kubernetes · AWS';
      return { text: skills, topic: 'skills', links: [resumeLink, link(t('services'), 'services.html')] };
    }
    if (any(query, ['publication', 'research paper', 'journal', 'doi', 'published research', 'اشاعت', 'منشورات'])) {
      return { text: 'The résumé lists three research publications, with DOI links: 10.1016/j.asej.2025.103714, 10.1109/ACCESS.2026.3683571 and 10.1016/j.asej.2026.104453. Open the résumé for their titles and source links.', topic: 'research', links: [resumeLink] };
    }
    if (any(query, ['widenet', 'skin lesion segmentation', 'skin lesion paper'])) {
      return { text: 'WIDENet is Muhammad Hamza’s lightweight CNN research on skin-lesion segmentation, combining multi-resolution wavelets, transformer context and attentive feature refinement. It was published in IEEE Access in 2026.', topic: 'research', links: [link('WIDENet DOI', 'https://doi.org/10.1109/ACCESS.2026.3683571'), resumeLink] };
    }
    if (any(query, ['diabetic retinopathy', 'retinopathy paper', 'retinal diagnosis'])) {
      return { text: 'His 2026 diabetic-retinopathy paper presents a compact hierarchical vision encoder for five-class grading, with stability-driven normalization and regularization. The résumé reports 98.91% accuracy on APTOS.', topic: 'research', links: [link('Retinopathy paper DOI', 'https://doi.org/10.1016/j.asej.2026.104453'), resumeLink] };
    }
    if (any(query, ['achievement', 'award', 'scholarship', 'certificate', 'kaggle badge', 'laptop scheme', 'کامیابی', 'إنجاز'])) {
      var achievements = language === 'en' ? 'Published achievements include a fully funded 2025 unmanned-aerial-systems scholarship at Samara National Research University, a 2023 Prime Minister’s Youth Laptop Scheme merit award, and Kaggle Notebook Expert status. The résumé links to supporting announcements.' : factT('Certifications & Achievements') + ':\n' + factT('Fully Funded Scholar — Design & Development of Unmanned Aerial Systems') + ' · 2025\n' + factT('Prime Minister’s Youth Laptop Scheme — Merit Recipient') + ' · 2023\n' + factT('Kaggle Notebook Expert Badge, Kaggle');
      return { text: achievements, topic: 'achievements', links: [resumeLink, link(t('about') === 'about' ? 'Achievements' : t('about'), 'index.html#achievements')] };
    }
    if (any(query, ['github profile', 'kaggle profile', 'linkedin profile', 'google scholar', 'researchgate', 'fiverr profile', 'social profile'])) {
      return { text: 'Muhammad Hamza’s professional profiles include GitHub, LinkedIn, Kaggle, Fiverr, Google Scholar and ResearchGate. The résumé and Work Platforms section contain the direct links.', topic: 'profiles', links: [link('Professional profiles', 'index.html#platforms'), resumeLink] };
    }
    if (any(query, ['testimonial', 'client review', 'what clients say', 'feedback from clients'])) {
      return { text: 'Client feedback is published in the Testimonials section. His résumé also reports a 4.8/5 Fiverr rating across 13 client reviews.', topic: 'testimonials', links: [link('Testimonials', 'index.html#testimonials'), resumeLink] };
    }
    if (any(query, ['photo', 'picture', 'portrait', 'gallery', 'image of hamza', 'تصویر', 'صورة', 'galería', 'galerie'])) {
      var gallery = window.PortfolioPageIntros && window.PortfolioPageIntros.gallery;
      return { text: gallery ? (gallery[language] || gallery.en).text : 'The photo gallery shows Muhammad Hamza’s professional portraits, AI development work, team collaboration and career milestones.', topic: 'gallery', links: [link(t('gallery') === 'gallery' ? 'Photo gallery' : t('gallery'), 'gallery.html')] };
    }
    // A named project takes priority over broad service keywords such as RAG.
    var named = projectFacts.find(function (fact) { return fact[2].some(function (name) { return contains(query, name); }); });
    if (named) return { text: projectDescription(named), topic: 'projects', links: [projectLink(named), link(t('projects'), 'portfolio.html'), contactLink] };
    if (projectIntent) {
      var tags = ['rag', 'agentic', 'cybersecurity', 'security', 'computer vision', 'vision', 'cv', 'medical', 'mri', 'alzheimer', 'classification', 'fraud', 'automation', 'prediction', 'drone', 'satellite', 'warehouse', 'research', 'flutter', 'scheduling', 'machine learning'];
      var matchedTags = tags.filter(function (tag) { return contains(query, tag); });
      if (matchedTags.length) {
        var matches = projectFacts.filter(function (fact) { return matchedTags.some(function (tag) { return fact[3].indexOf(tag) !== -1 || ((tag === 'vision' || tag === 'cv') && fact[3].indexOf('computer vision') !== -1); }); }).slice(0, 3);
        if (matches.length) return { text: matches.map(projectDescription).join('\n\n'), topic: 'projects', links: matches.map(projectLink).concat([link(t('projects'), 'portfolio.html')]) };
      }
      return { text: 'The portfolio presents 15 published case studies across agentic AI, RAG, cybersecurity, computer vision, medical imaging, automation, and classical machine learning. Open the portfolio to browse each overview and its methods.', topic: 'projects', links: [link(t('projects'), 'portfolio.html')] };
    }
    return null;
  }
  function answer(question) {
    var query = normalize(question).slice(0, 1000);
    var rules = domainRules[language] || domainRules.en;
    function domain(name) { return any(query, domainRules.en[name].concat(language === 'en' ? [] : rules[name])); }
    var financial = domain('finance');
    var fraud = domain('fraud');
    var anomaly = domain('anomaly');
    var visual = domain('visual');
    var costTerms = topicTerms('cost', ['price', 'cost', 'pricing', 'rate', 'budget', 'charge', 'fee', 'how much', 'قیمت', 'کتنے پیسے', 'لاگت', 'کتنا خرچ', 'سعر', 'تكلفة', 'ميزانية', 'رسوم', 'كم يكلف', 'qeemat', 'paisa', 'paise', 'kharcha']);
    // Transaction charges and error rates describe data, not service pricing.
    if (financial || fraud || anomaly) costTerms = costTerms.filter(function (term) { return term !== 'charge' && term !== 'rate'; }).concat(['charge for', 'rate for', 'hourly rate']);
    if (any(query, costTerms)) {
      return { text: t('cost'), topic: 'cost', links: [link(t('contact'), 'contact.html')] };
    }
    if (any(query, topicTerms('timeline', ['timeline', 'how long', 'duration', 'delivery', 'deadline', 'days', 'وقت', 'کتنے دن', 'مدت', 'موعد', 'مدة', 'ايام', 'وقت التسليم', 'kab', 'kitne din', 'waqt']))) {
      return { text: t('timeline'), topic: 'timeline', links: [link(t('contact'), 'contact.html')] };
    }
    var grounded = knowledgeAnswer(query);
    if (grounded) return grounded;
    var cvActions = ['download', 'send', 'share', 'open', 'view', 'ڈاؤن لوڈ', 'بھیجیں', 'شیئر', 'کھولیں', 'دیکھیں', 'تحميل', 'ارسل', 'ارسال', 'شارك', 'افتح', 'عرض', '下载', '分享', '发送', '打开', '查看', 'डाउनलोड', 'भेजें', 'साझा', 'खोलें', 'देखें', 'descargar', 'compartir', 'enviar', 'abrir', 'ver', 'télécharger', 'partager', 'envoyer', 'ouvrir', 'voir', 'baixar', 'compartilhar', 'ডাউনলোড', 'পাঠান', 'শেয়ার', 'খুলুন', 'দেখুন', 'скачать', 'отправить', 'поделиться', 'открыть', 'посмотреть', 'unduh', 'kirim', 'bagikan', 'buka', 'lihat', 'herunterladen', 'teilen', 'senden', 'öffnen', 'ansehen', 'ダウンロード', '送って', '共有', '開く', '見る', 'indir', 'paylaş', 'gönder', 'görüntüle', 'tải xuống', 'gửi', 'chia sẻ', 'mở', 'xem', '다운로드', '보내', '공유', '열기', '보기', 'ดาวน์โหลด', 'ส่ง', 'แชร์', 'เปิด', 'ดู', 'دانلود', 'ارسال', 'بفرست', 'اشتراک', 'مشاهده', 'பதிவிறக்க', 'பகிர்', 'அனுப்பு', 'திற', 'பார்க்க', 'డౌన్‌లోడ్', 'పంపు', 'పంచుకో', 'తెరవ', 'చూడండి'];
    var cvMeansResume = contains(query, 'cv') && any(query, cvActions) && !any(query, topicTerms('cv', ['computer vision', 'model', 'image', 'video', 'yolo', 'opencv', 'detection', 'vision service', 'وژن', 'تصویر', 'صور', 'رؤية']));
    var resumeTerms = financial || fraud || anomaly
      ? ['resume', 'curriculum', 'ریزیومے', 'سی وی', 'سيرة'].concat(((localeKeywords[language] || {}).resume || []).slice(0, 1))
      : topicTerms('resume', ['resume', 'curriculum', 'experience', 'ریزیومے', 'سی وی', 'تجربہ', 'سيرة', 'خبرة']);
    if (cvMeansResume || any(query, resumeTerms)) {
      return { text: t('resumeAnswer'), topic: 'resume', links: [link(t('resume'), 'resume/index.html')] };
    }
    if (any(query, topicTerms('contact', ['contact', 'email', 'whatsapp', 'hire', 'get in touch', 'reach you', 'رابطہ', 'ای میل', 'واٹس', 'اتصال', 'تواصل', 'بريد', 'واتساب', 'rabta']))) {
      return { text: t('contactAnswer') + ' WhatsApp: +92 341 7215920.', topic: 'contact', links: [link('WhatsApp +92 341 7215920', 'https://wa.me/923417215920'), link(t('contact'), 'contact.html')] };
    }
    if (financial || (fraud && !visual)) {
      var financialAnswer = serviceAnswer('data');
      financialAnswer.note = rules.note;
      financialAnswer.links.splice(1, 0, link(rules.related, 'projects/ai-ticket-scalping-prevention.html'));
      return financialAnswer;
    }
    if (anomaly && !visual) return serviceAnswer('research');
    if (any(query, topicTerms('projects', ['project', 'portfolio', 'work samples', 'پراجیکٹ', 'منصوب', 'مشاريع', 'اعمال']))) {
      // A request for a service project should still retrieve that service.
      var specific = serviceData.some(function (service) { return any(query, serviceTerms(service)); });
      if (!specific) return { text: t('projectsAnswer'), topic: 'projects', links: [link(t('projects'), 'portfolio.html')] };
    }
    var ranked = serviceData.map(function (service) {
      var matches = serviceTerms(service).filter(function (keyword) { return contains(query, keyword); });
      return { service: service, score: matches.reduce(function (score, keyword) { return score + (keyword.length < 4 ? 3 : 2); }, 0), length: matches.reduce(function (length, keyword) { return Math.max(length, keyword.length); }, 0) };
    }).filter(function (item) { return item.score > 0; }).sort(function (a, b) { return b.score - a.score || b.length - a.length; });
    if (ranked.length) {
      return serviceAnswer(ranked[0].service.id);
    }
    if (any(query, topicTerms('services', ['services', 'service', 'help', 'offer', 'what do you do', 'مدد', 'خدمات', 'کیا کرتے', 'خدمة', 'خدمات', 'مساعدة', 'madad', 'kya kar', 'kaise help']))) {
      return { text: t('serviceList'), topic: 'services', links: [link(t('services'), 'services.html')] };
    }
    if (/^(hello|hi|hey|welcome|salam|assalam|aoa|السلام|سلام|مرحبا|اهلا)/.test(query) || any(query, topicTerms('greeting', []))) {
      return { text: t('greeting') + ' ' + t('help'), topic: 'greeting', links: [link(t('services'), 'services.html'), link(t('contact'), 'contact.html')] };
    }
    return { text: t('unknown'), topic: 'unknown', links: [link(t('services'), 'services.html'), link(t('contact'), 'contact.html')] };
  }

  function narrationEntries() {
    var result = {};
    var tourKeys = ['tourWelcome', 'tourServices', 'tourProjects', 'tourResume', 'tourContact', 'help'];
    var answerKeys = { cost: 'cost', timeline: 'timeline', resume: 'resumeAnswer', projects: 'projectsAnswer', contact: 'contactAnswer', services: 'serviceList', unknown: 'unknown' };
    languages.forEach(function (item) {
      var strings = ui[item.code];
      var entries = tourKeys.map(function (key) { return { key: key, text: strings[key] }; });
      entries.push({ key: 'welcome', text: strings.greeting });
      entries.push({ key: 'greeting', text: strings.greeting + ' ' + strings.help });
      Object.keys(answerKeys).forEach(function (key) { entries.push({ key: key, text: strings[answerKeys[key]] }); });
      serviceData.forEach(function (service) {
        entries.push({ key: service.id, text: serviceText(service, item.code) });
      });
      result[item.code] = entries;
    });
    return result;
  }

  function registerLocale(definition) {
    var meta = definition.language;
    if (!meta || !meta.code || languages.some(function (item) { return item.code === meta.code; })) return false;
    if (Object.keys(ui.en).some(function (key) { return typeof definition.ui[key] !== 'string' || !definition.ui[key]; })) return false;
    if (copy.some(function (row) { return typeof definition.copy[row[0]] !== 'string' || !definition.copy[row[0]]; })) return false;
    ui[meta.code] = definition.ui;
    copy.forEach(function (row) { translations[row[0]][meta.code] = definition.copy[row[0]]; });
    localeKeywords[meta.code] = definition.keywords || {};
    languages.push(meta);
    if (savedLanguage === meta.code && language !== meta.code) { language = meta.code; if (initialized) activateLanguage(false); }
    return true;
  }
  function sourceEntries() {
    return { ui: Object.assign({}, ui.en), copy: Array.from(new Set(copy.map(function (row) { return row[0]; }))), services: serviceData.map(function (service) { return { id: service.id, rows: service.rows.map(function (row) { return row[0]; }) }; }) };
  }
  window.PortfolioLocale = { languages: languages, getLanguage: function () { return language; }, setLanguage: setLanguage, t: t, answer: answer, narrationEntries: narrationEntries, registerLocale: registerLocale, sourceEntries: sourceEntries, registerPageCopy:registerPageCopy, getPageStatus:pageStatus, whenReady:function () { return languageReady; } };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
}());
