
        // -------------------------------------------------------------
        // ۱. ایموجی‌های مرتبط با هر کالا (برای زیبایی کارت‌ها)
        // -------------------------------------------------------------
        const EMOJI_MAP = {
            "سیب": "🍎", "موز": "🍌", "پرتقال": "🍊", "انگور": "🍇", "توت‌فرنگی": "🍓",
            "هندوانه": "🍉", "طالبی": "🍈", "گلابی": "🍐", "هلو": "🍑", "لیمو": "🍋",
            "کاهو": "🥬", "گوجه": "🍅", "خیار": "🥒", "هویج": "🥕", "پیاز": "🧅",
            "سیر": "🧄", "سیب‌زمینی": "🥔", "سیب‌زمینی شیرین": "🍠", "قارچ": "🍄", "فلفل دلمه‌ای": "🫑",
            "شیر": "🥛", "ماست": "🫗", "کره": "🧈", "خامه": "🧁", "پنیر": "🧀",
            "تخم‌مرغ": "🥚", "مرغ": "🍗", "گوشت گوساله": "🥩", "ماهی": "🐟", "برنج": "🍚",
            "ماکارونی": "🍝", "نان": "🍞", "روغن زیتون": "🫒", "سرکه": "🧂", "نمک": "🧂",
            "شکر": "🍬", "آرد": "🌾", "عسل": "🍯", "مربا": "🍓", "کره بادام‌زمینی": "🥜",
            "غلات": "🥣", "جو دوسر": "🌾", "قهوه": "☕", "چای": "🍵", "آبمیوه": "🧃",
            "نوشابه": "🥤", "آب معدنی": "💧", "چیپس": "🍟", "شکلات": "🍫", "بیسکویت": "🍪"
        };

        // -------------------------------------------------------------
        // ۲. رندر کردن کارت‌های محصولات
        // -------------------------------------------------------------
        const container = document.getElementById('itemsContainer');
        ITEMS.forEach((name, idx) => {
            const emoji = EMOJI_MAP[name] || '📦';
            const card = document.createElement('div');
            card.className = 'item-card';
            card.innerHTML = `
                <div class="item-emoji">${emoji}</div>
                <div class="item-name">${name}</div>
                <select id="rating-${idx}">
                    <option value="0">-</option>
                    <option value="1">۱</option>
                    <option value="2">۲</option>
                    <option value="3" selected>۳</option>
                    <option value="4">۴</option>
                    <option value="5">۵</option>
                </select>
                <div class="rating-label">امتیاز شما</div>
            `;
            container.appendChild(card);
        });

        // -------------------------------------------------------------
        // ۳. توابع محاسبه شباهت (همان ۱۲ روش)
        // -------------------------------------------------------------
        // --- فاصله‌ها ---
        function euclideanDist(a, b) {
            let sum = 0;
            for (let i = 0; i < a.length; i++) sum += (a[i] - b[i]) ** 2;
            return Math.sqrt(sum);
        }
        function manhattanDist(a, b) {
            let sum = 0;
            for (let i = 0; i < a.length; i++) sum += Math.abs(a[i] - b[i]);
            return sum;
        }
        function minkowskiDist(a, b, p = 3) {
            let sum = 0;
            for (let i = 0; i < a.length; i++) sum += Math.pow(Math.abs(a[i] - b[i]), p);
            return Math.pow(sum, 1 / p);
        }
        function chebyshevDist(a, b) {
            let max = 0;
            for (let i = 0; i < a.length; i++) {
                const diff = Math.abs(a[i] - b[i]);
                if (diff > max) max = diff;
            }
            return max;
        }

        // --- شباهت‌ها ---
        function cosineSim(a, b) {
            let dot = 0, normA = 0, normB = 0;
            for (let i = 0; i < a.length; i++) {
                dot += a[i] * b[i];
                normA += a[i] * a[i];
                normB += b[i] * b[i];
            }
            if (normA === 0 || normB === 0) return 0;
            return dot / (Math.sqrt(normA) * Math.sqrt(normB));
        }
        function adjustedCosineSim(a, b) {
            const meanA = a.reduce((s, v) => s + v, 0) / a.length;
            const meanB = b.reduce((s, v) => s + v, 0) / b.length;
            const adjA = a.map(v => v - meanA);
            const adjB = b.map(v => v - meanB);
            return cosineSim(adjA, adjB);
        }
        function pearsonCorr(a, b) {
            const meanA = a.reduce((s, v) => s + v, 0) / a.length;
            const meanB = b.reduce((s, v) => s + v, 0) / b.length;
            let num = 0, denA = 0, denB = 0;
            for (let i = 0; i < a.length; i++) {
                const da = a[i] - meanA;
                const db = b[i] - meanB;
                num += da * db;
                denA += da * da;
                denB += db * db;
            }
            if (denA === 0 || denB === 0) return 0;
            return num / (Math.sqrt(denA) * Math.sqrt(denB));
        }
        function naivePearson(a, b) {
            let sumA = 0, sumB = 0, sumASq = 0, sumBSq = 0, sumAB = 0;
            const n = a.length;
            for (let i = 0; i < n; i++) {
                sumA += a[i];
                sumB += b[i];
                sumASq += a[i] * a[i];
                sumBSq += b[i] * b[i];
                sumAB += a[i] * b[i];
            }
            const num = n * sumAB - sumA * sumB;
            const den = Math.sqrt((n * sumASq - sumA * sumA) * (n * sumBSq - sumB * sumB));
            if (den === 0) return 0;
            return num / den;
        }
        function pearsonMedian(a, b) {
            const sortedA = [...a].sort((x, y) => x - y);
            const sortedB = [...b].sort((x, y) => x - y);
            const medianA = sortedA[Math.floor(sortedA.length / 2)];
            const medianB = sortedB[Math.floor(sortedB.length / 2)];
            const adjA = a.map(v => v - medianA);
            const adjB = b.map(v => v - medianB);
            return cosineSim(adjA, adjB);
        }
        function spearmanCorr(a, b) {
            function rank(arr) {
                const sorted = arr.map((v, i) => ({ v, i })).sort((x, y) => x.v - y.v);
                const ranks = new Array(arr.length);
                let pos = 0;
                while (pos < sorted.length) {
                    let end = pos;
                    while (end < sorted.length && sorted[end].v === sorted[pos].v) end++;
                    const rankVal = (pos + end - 1) / 2 + 1;
                    for (let k = pos; k < end; k++) ranks[sorted[k].i] = rankVal;
                    pos = end;
                }
                return ranks;
            }
            const rankA = rank(a);
            const rankB = rank(b);
            return pearsonCorr(rankA, rankB);
        }
        function goodmanKruskalGamma(a, b) {
            let concordant = 0, discordant = 0;
            const n = a.length;
            for (let i = 0; i < n; i++) {
                for (let j = i + 1; j < n; j++) {
                    const diffA = a[i] - a[j];
                    const diffB = b[i] - b[j];
                    if (diffA === 0 || diffB === 0) continue;
                    if ((diffA > 0 && diffB > 0) || (diffA < 0 && diffB < 0)) concordant++;
                    else discordant++;
                }
            }
            const total = concordant + discordant;
            if (total === 0) return 0;
            return (concordant - discordant) / total;
        }
        function jaccardSim(a, b) {
            const setA = a.map(v => v >= 4 ? 1 : 0);
            const setB = b.map(v => v >= 4 ? 1 : 0);
            let intersection = 0, union = 0;
            for (let i = 0; i < a.length; i++) {
                if (setA[i] === 1 && setB[i] === 1) intersection++;
                if (setA[i] === 1 || setB[i] === 1) union++;
            }
            if (union === 0) return 0;
            return intersection / union;
        }

        // -------------------------------------------------------------
        // ۴. رویداد دکمه محاسبه
        // -------------------------------------------------------------
        document.getElementById('calcBtn').addEventListener('click', function () {
            // ۴-۱: دریافت امتیازات کاربر ۱۰۱
            const userVector = [];
            let allRated = true;
            for (let i = 0; i < ITEMS.length; i++) {
                const val = parseInt(document.getElementById(`rating-${i}`).value);
                if (val === 0) { allRated = false; userVector.push(3); }
                else userVector.push(val);
            }
            if (!allRated) {
                alert('⚠️ به همه کالاها امتیاز ندادید. برای موارد بدون امتیاز، مقدار ۳ در نظر گرفته شد.');
            }

            const numUsers = USER_RATINGS.length;

            // ۴-۲: تعریف روش‌ها
            const methods = [
                { id: 'jaccard', name: 'جاکارد (باینری)' },
                { id: 'manhattan', name: 'فاصله منهتن' },
                { id: 'euclidean', name: 'فاصله اقلیدسی' },
                { id: 'minkowski', name: 'فاصله مینکوفسکی (p=3)' },
                { id: 'chebyshev', name: 'فاصله چبیشف' },
                { id: 'cosine', name: 'تشابه کسینوسی' },
                { id: 'adjusted_cosine', name: 'کسینوسی تحمیل‌شده' },
                { id: 'pearson', name: 'همبستگی پیرسون' },
                { id: 'naive_pearson', name: 'پیرسون ساده‌لوحانه' },
                { id: 'pearson_median', name: 'پیرسون (میانه)' },
                { id: 'spearman', name: 'همبستگی اسپیرمن' },
                { id: 'goodman', name: 'همبستگی گودمن (گاما)' }
            ];

            // ۴-۳: محاسبه بهترین کاربر برای هر روش
            const results = methods.map(method => {
                const isDistance = ['manhattan', 'euclidean', 'minkowski', 'chebyshev'].includes(method.id);
                let bestUserIdx = -1;
                let bestValue = isDistance ? Infinity : -Infinity;

                for (let u = 0; u < numUsers; u++) {
                    const other = USER_RATINGS[u];
                    let val;
                    switch (method.id) {
                        case 'jaccard': val = jaccardSim(userVector, other); break;
                        case 'manhattan': val = manhattanDist(userVector, other); break;
                        case 'euclidean': val = euclideanDist(userVector, other); break;
                        case 'minkowski': val = minkowskiDist(userVector, other, 3); break;
                        case 'chebyshev': val = chebyshevDist(userVector, other); break;
                        case 'cosine': val = cosineSim(userVector, other); break;
                        case 'adjusted_cosine': val = adjustedCosineSim(userVector, other); break;
                        case 'pearson': val = pearsonCorr(userVector, other); break;
                        case 'naive_pearson': val = naivePearson(userVector, other); break;
                        case 'pearson_median': val = pearsonMedian(userVector, other); break;
                        case 'spearman': val = spearmanCorr(userVector, other); break;
                        case 'goodman': val = goodmanKruskalGamma(userVector, other); break;
                        default: val = 0;
                    }
                    if (isDistance) {
                        if (val < bestValue) { bestValue = val; bestUserIdx = u; }
                    } else {
                        if (val > bestValue) { bestValue = val; bestUserIdx = u; }
                    }
                }

                // درصد شباهت
                let percentage = 0;
                if (isDistance) {
                    const sim = 1 / (1 + bestValue);
                    percentage = sim * 100;
                } else {
                    if (method.id === 'jaccard') {
                        percentage = bestValue * 100;
                    } else {
                        const normalized = Math.max(0, (bestValue + 1) / 2);
                        percentage = normalized * 100;
                    }
                }

                return {
                    methodName: method.name,
                    methodId: method.id,
                    bestUser: bestUserIdx + 1,
                    value: bestValue,
                    percentage: percentage,
                    bestUserIdx: bestUserIdx
                };
            });

            // ۴-۴: نمایش جدول شباهت‌ها
            const tbody = document.getElementById('similarityTableBody');
            tbody.innerHTML = '';
            results.forEach((res, idx) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${idx+1}</td>
                    <td class="method-name">${res.methodName}</td>
                    <td><span class="badge-user">#${res.bestUser}</span></td>
                    <td>${typeof res.value === 'number' ? res.value.toFixed(4) : res.value}</td>
                    <td><span class="highlight-percent">${res.percentage.toFixed(2)}%</span></td>
                `;
                tbody.appendChild(tr);
            });

            // ۴-۵: تولید پیشنهادات ویژه (بر اساس کاربر شبیه‌ترین از روش کسینوسی)
            // انتخاب کاربر با بیشترین شباهت کسینوسی
            const cosineResult = results.find(r => r.methodId === 'cosine');
            if (cosineResult) {
                const bestUserIdx = cosineResult.bestUserIdx;
                const bestUserRatings = USER_RATINGS[bestUserIdx];
                const recommendations = [];

                for (let i = 0; i < ITEMS.length; i++) {
                    const myRating = userVector[i];
                    const similarRating = bestUserRatings[i];
                    // شرط: کاربر شبیه امتیاز ≥ ۴ داده و کاربر فعلی ≤ ۲ داده (یا ۳ پیش‌فرض)
                    if (similarRating >= 4 && myRating <= 2) {
                        recommendations.push({
                            itemName: ITEMS[i],
                            emoji: EMOJI_MAP[ITEMS[i]] || '📦',
                            similarRating: similarRating,
                            myRating: myRating,
                            score: similarRating * cosineResult.value // وزن‌دهی
                        });
                    }
                }

                // مرتب‌سازی بر اساس امتیاز کاربر شبیه (نزولی)
                recommendations.sort((a, b) => b.similarRating - a.similarRating);

                const recDiv = document.getElementById('recommendationsList');
                if (recommendations.length === 0) {
                    recDiv.innerHTML = `<div class="no-recommend"> هیچ پیشنهاد جدیدی یافت نشد! شما و کاربر شبیه‌ترین سلیقه‌ای یکسان دارید.</div>`;
                } else {
                    const topRecs = recommendations.slice(0, 6);
                    recDiv.innerHTML = topRecs.map((rec, idx) => `
                        <div class="rec-item">
                            <div class="rec-name">
                                <span class="rec-emoji">${rec.emoji}</span>
                                ${rec.itemName}
                                <span class="rec-detail">(امتیاز کاربر شبیه: ${rec.similarRating}⭐)</span>
                            </div>
                            <div class="rec-score">پیشنهاد #${idx+1}</div>
                        </div>
                    `).join('');
                    // توضیح زیر لیست
                    // recDiv.innerHTML += `<p style="margin-top:15px; font-size:14px; color:#555;"> این کالاها توسط کاربر #${cosineResult.bestUser} (شبیه‌ترین از نظر کسینوسی) امتیاز ≥۴ گرفته‌اند، در حالی که شما امتیاز ≤۲ داده‌اید.</p>`;
                }
            }

            // نمایش بخش نتایج
            document.getElementById('resultsArea').style.display = 'block';
            document.getElementById('resultsArea').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
 