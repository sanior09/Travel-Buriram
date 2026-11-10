// พิกัดจังหวัดบุรีรัมย์ (Latitude, Longitude)
const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast?latitude=14.9930&longitude=103.1029&current_weather=true&timezone=Asia%2FBangkok";

document.addEventListener('DOMContentLoaded', () => {
    // 1. เริ่มทำงานนาฬิกา
    updateClock();
    setInterval(updateClock, 1000);

    // 2. ดึงข้อมูลสภาพอากาศ
    getWeather();

    // 3. ตั้งค่าการทำงานของปุ่มต่างๆ
    setupUI();

    // 4. เพิ่มข้อมูลเวลาเปิด-ปิด
    addOpeningHours();
    setInterval(updateOpeningStatus, 60000); // อัปเดตสถานะเปิด-ปิดทุก 1 นาที

    // 5. ป้องกันรูปภาพโหลดไม่ขึ้น (Fallback Image Handler)
    setupImageFallback();
});

// ฟังก์ชันจัดการรูปภาพสำรองหากรูปภาพโหลดไม่สำเร็จ
function setupImageFallback() {
    const fallbackUrl = 'https://upload.wikimedia.org/wikipedia/commons/8/87/%E0%B8%9B%E0%B8%A3%E0%B8%B2%E0%B8%AA%E0%B8%B2%E0%B8%97%E0%B8%A3%E0%B9%80%E0%B8%82%E0%B8%B2%E0%B8%9E%E0%B8%99%E0%B8%A1%E0%B8%A3%E0%B8%B8%E0%B9%89%E0%B8%87IDSC_0827.jpg';
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function() {
            if (!this.dataset.fallback) {
                this.dataset.fallback = 'true';
                this.src = fallbackUrl;
            }
        });
    });
}

window.addEventListener('load', () => {
    // ซ่อนหน้า Loading Screen เมื่อโหลดเสร็จ
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            loadingScreen.style.transition = 'opacity 0.2s ease';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 200);
        }, 500); // ลดเวลาการรอจาก 2 วินาที เหลือ 0.5 วินาที
    }
});

// ฟังก์ชันนาฬิกา
function updateClock() {
    const now = new Date();
    const days = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    const months = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

    const dayName = days[now.getDay()];
    const date = now.getDate();
    const month = months[now.getMonth()];
    const year = now.getFullYear() + 543; // พ.ศ.

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const dayNameEl = document.getElementById('dayName');
    const fullDateEl = document.getElementById('fullDate');
    const liveTimeEl = document.getElementById('liveTime');

    if (dayNameEl) dayNameEl.textContent = `วัน${dayName}`;
    if (fullDateEl) fullDateEl.textContent = `${date} ${month} ${year}`;
    if (liveTimeEl) liveTimeEl.textContent = `${hours}:${minutes}:${seconds}`;
}

// ฟังก์ชันดึงสภาพอากาศ
async function getWeather() {
    try {
        const response = await fetch(WEATHER_API_URL);
        const data = await response.json();
        
        if (data.current_weather) {
            const temp = Math.round(data.current_weather.temperature);
            const weatherCode = data.current_weather.weathercode;
            
            document.getElementById('tempValue').textContent = temp;
            document.getElementById('weatherDesc').textContent = interpretWeatherCode(weatherCode);
            document.getElementById('weatherIcon').textContent = getWeatherIcon(weatherCode);
        }
    } catch (error) {
        console.error("Error fetching weather:", error);
        document.getElementById('weatherDesc').textContent = "ไม่สามารถโหลดข้อมูล";
    }
}

function interpretWeatherCode(code) {
    const codes = {
        0: "ท้องฟ้าแจ่มใส", 1: "มีเมฆบางส่วน", 2: "มีเมฆเป็นส่วนมาก", 3: "มีเมฆมากปกคลุม",
        45: "มีหมอก", 48: "มีหมอกหนาจัด", 51: "มีฝนปรอยๆ", 53: "มีฝนตกปานกลาง",
        55: "มีฝนตกหนัก", 61: "มีฝนตกเล็กน้อย", 63: "มีฝนตกปานกลาง", 65: "มีฝนตกหนัก",
        80: "มีฝนตกเป็นระลอก", 81: "มีฝนตกหนัก", 82: "มีฝนตกหนักมาก",
        95: "มีฝนฟ้าคะนอง", 96: "ฝนฟ้าคะนองและลูกเห็บ", 99: "ฝนฟ้าคะนองรุนแรง"
    };
    return codes[code] || "ไม่มีข้อมูล";
}

function getWeatherIcon(code) {
    if (code === 0) return "☀️";
    if ([1, 2, 3].includes(code)) return "⛅";
    if ([45, 48].includes(code)) return "🌫️";
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "🌧️";
    if ([95, 96, 99].includes(code)) return "⚡";
    return "☁️";
}

function setupUI() {
    // ปุ่มติดต่อ
    const btnContact = document.getElementById('btnContact');
    const contactDetails = document.getElementById('contactDetails');
    if (btnContact && contactDetails) {
        btnContact.addEventListener('click', () => {
            contactDetails.classList.toggle('hidden');
            btnContact.textContent = contactDetails.classList.contains('hidden') ? 'แสดงช่องทางติดต่อ' : 'ซ่อนช่องทางติดต่อ';
        });
    }

    // Hamburger Menu (เมนูมือถือ)
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
        // ปิดเมนูเมื่อคลิกลิงก์
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => navLinks.classList.remove('active'));
        });
    }

    // Back to Top Button
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) backToTop.classList.add('show');
            else backToTop.classList.remove('show');
        });
        backToTop.addEventListener('click', (e) => {
            e.preventDefault();
            const duration = 1000; // ปรับความเร็วตรงนี้ (1000ms = 1 วินาที)
            const start = window.scrollY;
            const startTime = performance.now();

            function animateScroll(currentTime) {
                const timeElapsed = currentTime - startTime;
                const progress = Math.min(timeElapsed / duration, 1);
                const ease = 1 - Math.pow(1 - progress, 4); // สูตรคำนวณความสมูท (Ease Out Quart)

                window.scrollTo(0, start * (1 - ease));

                if (timeElapsed < duration) requestAnimationFrame(animateScroll);
            }
            requestAnimationFrame(animateScroll);
        });
    }

    // Video Modal Logic
    const modal = document.getElementById('videoModal');
    const videoPlayer = document.getElementById('videoPlayer');
    const closeModal = document.querySelector('.close-modal');
    
    document.querySelectorAll('.btn-video').forEach(btn => {
        btn.addEventListener('click', () => {
            const videoId = btn.getAttribute('data-video');
            if (videoId && modal && videoPlayer) {
                videoPlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
                modal.style.display = 'block';
            }
        });
    });

    if (closeModal && modal && videoPlayer) {
        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
            videoPlayer.src = '';
        });
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                videoPlayer.src = '';
            }
        });
    }

    // Scroll Reveal Animation
    const reveals = document.querySelectorAll('.reveal');
    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const elementVisible = 150;
        reveals.forEach(reveal => {
            const elementTop = reveal.getBoundingClientRect().top;
            if (elementTop < windowHeight - elementVisible) {
                reveal.classList.add('active');
            }
        });
    };
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Trigger once on load
}

// ฟังก์ชันเพิ่มเวลาเปิด-ปิด ให้กับการ์ดสถานที่
function addOpeningHours() {
    const cards = document.querySelectorAll('#places .card');
    
    const placesData = {
        "อุทยานประวัติศาสตร์พนมรุ้ง": { time: "07:00 - 18:00 น.", days: "เปิดทุกวัน", phone: "044-666-251" },
        "ปราสาทเมืองต่ำ": { time: "07:30 - 18:00 น.", days: "เปิดทุกวัน", phone: "044-666-251" },
        "สนามช้างอารีนา": { time: "09:30 - 16:30 น.", days: "เปิดทุกวัน", phone: "044-600-111" },
        "วนอุทยานเขากระโดง": { time: "08:00 - 18:00 น.", days: "เปิดทุกวัน", phone: "044-637-349" },
        "เพลาเพลิน": { time: "09:00 - 17:00 น.", days: "เปิดทุกวัน", phone: "044-634-736" },
        "วัดเขาอังคาร": { time: "06:00 - 17:00 น.", days: "เปิดทุกวัน", phone: "044-611-142" },
        "วัดป่าเขาน้อย": { time: "06:00 - 18:00 น.", days: "เปิดทุกวัน", phone: "044-611-142" },
        "ศาลหลักเมืองบุรีรัมย์": { time: "06:00 - 20:00 น.", days: "เปิดทุกวัน", phone: "044-602-345" },
        "ถนนคนเดินเซราะกราว": { time: "17:00 - 22:00 น.", days: "เสาร์-อาทิตย์", phone: "044-602-345" },
        "อ่างเก็บน้ำห้วยจระเข้มาก": { time: "08:30 - 16:30 น.", days: "เปิดทุกวัน", phone: "044-637-349" },
        "หมู่บ้านสนวนนอก": { time: "09:00 - 16:00 น.", days: "เปิดทุกวัน", phone: "080-469-1956" },
        "ศูนย์อนุรักษ์นกกระเรียนพันธุ์ไทย": { time: "08:30 - 16:30 น.", days: "เปิดทุกวัน", phone: "044-637-349" },
        "พระบรมราชานุสาวรีย์รัชกาลที่ 1": { time: "00:00 - 23:59 น.", days: "เปิดทุกวัน", phone: "044-602-345" },
        "สนามช้างอินเตอร์เนชั่นแนลเซอร์กิต": { time: "09:00 - 17:00 น.", days: "เปิดทุกวัน", phone: "044-600-111" },
        "เขื่อนลำนางรอง": { time: "08:30 - 18:00 น.", days: "เปิดทุกวัน", phone: "044-611-142" },
        "หาดปราสาททอง": { time: "08:00 - 18:00 น.", days: "เปิดทุกวัน", phone: "044-611-142" },
        "วัดเกาะแก้วธุดงคสถาน": { time: "08:00 - 17:00 น.", days: "เปิดทุกวัน", phone: "044-611-142" },
        "ปราสาทหนองหงส์": { time: "08:00 - 17:00 น.", days: "เปิดทุกวัน", phone: "044-666-251" },
        "สวนคุณปู่": { time: "08:00 - 19:00 น.", days: "เปิดทุกวัน", phone: "081-955-5555" },
        "วัดกลางพระอารามหลวง": { time: "06:00 - 18:00 น.", days: "เปิดทุกวัน", phone: "044-611-142" }
    };

    const locationLinks = {
        "อุทยานประวัติศาสตร์พนมรุ้ง": "https://maps.app.goo.gl/example1",
        "ปราสาทเมืองต่ำ": "https://maps.app.goo.gl/example2"
        // ใช้ Default Search ของ Google Maps ที่เขียนไว้ในโค้ดด้านล่างแทนได้หากไม่มีลิงก์เจาะจง
    };

    cards.forEach(card => {
        const titleEl = card.querySelector('h3');
        if (!titleEl) return;
        
        const title = titleEl.textContent.trim();
        const body = card.querySelector('.card-body');
        // หาปุ่มวิดีโอเพื่อจะแทรกข้อมูลไว้ข้างบนปุ่ม
        const btn = card.querySelector('.btn-video') || card.querySelector('.video-btn'); 

        const cleanTitle = title.replace(/^\d+\.\s*/, '').trim(); // ตัดเลขลำดับออก เช่น "1. "
        
        // ดึงข้อมูลจาก placesData ถ้าไม่มีให้ใช้ค่า Default
        const data = placesData[cleanTitle] || { 
            time: "08:00 - 17:00 น.", 
            days: "เปิดทุกวัน", 
            phone: "044-634-722" // เบอร์ ททท. บุรีรัมย์
        };

        // สร้างลิงก์ Google Maps (ใช้ลิงก์ที่กำหนดไว้ หรือค้นหาถ้าไม่มี)
        const mapUrl = locationLinks[cleanTitle] || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanTitle + ' บุรีรัมย์')}`;

        // ตรวจสอบว่าเป็นวันเสาร์-อาทิตย์หรือไม่ ถ้าใช่ให้เปลี่ยนสีเป็นแดง ถ้าวันธรรมดาให้เป็นสีเขียว
        const isWeekend = data.days.includes('เสาร์') || data.days.includes('อาทิตย์');
        const color = isWeekend ? '#d32f2f' : '#2e7d32'; // แดง หรือ เขียว
        const daysStyle = `style="color: ${color}; font-weight: bold;"`;

        // เก็บข้อมูลลง dataset เพื่อให้อัปเดตได้แบบ Real-time
        card.dataset.schedule = JSON.stringify(data);

        const infoDiv = document.createElement('div');
        infoDiv.className = 'opening-info';
        infoDiv.innerHTML = `
            <div class="info-item"><span class="icon">📅</span> <span ${daysStyle}>${data.days}</span></div>
            <div class="info-item" style="flex-wrap: wrap;">
                <span class="icon">⏰</span> ${data.time} 
                <div class="status-display" style="width: 100%; text-align: center; margin-top: 5px; font-size: 0.9rem;">กำลังโหลด...</div>
            </div>
            <div class="info-item">
                <span class="icon">📞</span> <a href="tel:${data.phone.replace(/-/g,'')}">${data.phone}</a>
                <a href="${mapUrl}" target="_blank" class="map-link" title="ดูแผนที่">📍 แผนที่</a>
            </div>
        `;
        
        if (btn && body) body.insertBefore(infoDiv, btn);
        else if (body) body.appendChild(infoDiv);
    });

    // เรียกฟังก์ชันอัปเดตสถานะทันทีหลังจากสร้าง Element เสร็จ
    updateOpeningStatus();
}

// ฟังก์ชันอัปเดตสถานะ เปิด/ปิด แบบ Real-time
function updateOpeningStatus() {
    const cards = document.querySelectorAll('#places .card');
    const now = new Date();
    const currentDay = now.getDay(); // 0 = อาทิตย์, 6 = เสาร์
    const currentTime = now.getHours() * 60 + now.getMinutes();

    cards.forEach(card => {
        const statusDisplay = card.querySelector('.status-display');
        if (!statusDisplay || !card.dataset.schedule) return;

        try {
            const data = JSON.parse(card.dataset.schedule);
            let isOpen = false;

            // ตรวจสอบวันเปิด
            let isDayOpen = data.days.includes("ทุกวัน") || 
                           (data.days.includes("เสาร์") && currentDay === 6) ||
                           (data.days.includes("อาทิตย์") && currentDay === 0);
            
            // ตรวจสอบเวลา
            const timeMatch = data.time.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
            if (timeMatch && isDayOpen) {
                const openTime = parseInt(timeMatch[1]) * 60 + parseInt(timeMatch[2]);
                const closeTime = parseInt(timeMatch[3]) * 60 + parseInt(timeMatch[4]);
                
                if (currentTime >= openTime && currentTime < closeTime) {
                    isOpen = true;
                }
            }

            // อัปเดต UI
            if (isOpen) {
                statusDisplay.innerHTML = '<span style="color: #2e7d32; font-weight: bold; display: flex; align-items: center; justify-content: center;"><span class="status-dot"></span> เปิดอยู่ (Open Now)</span>';
            } else {
                statusDisplay.innerHTML = '<span style="color: #d32f2f; font-weight: bold;">● ปิดทำการ (Closed)</span>';
            }
        } catch (e) {
            console.error("Error updating status", e);
        }
    });
}