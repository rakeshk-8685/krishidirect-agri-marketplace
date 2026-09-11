import React, { useState, useMemo } from 'react';
import { Newspaper, ExternalLink, Tag, Search, ChevronRight, AlertTriangle, TrendingUp, CloudRain, BookOpen, Sprout, Bell, Calendar } from 'lucide-react';

const NEWS_ITEMS = [
  {
    id: 1,
    category: 'MSP Rates',
    title: 'Cabinet Approves MSP Hike for Kharif Crops 2026-27: Paddy at ₹2,400/Quintal',
    source: 'Press Information Bureau (PIB)',
    date: '06 Sep 2026',
    description: 'The Union Cabinet approved Minimum Support Prices (MSPs) for Kharif Marketing Season 2026-27. Paddy MSP raised to ₹2,400/quintal, a 5.8% hike. Cotton, Maize, Soybean also see significant increases to ensure cost-plus-50% margin for farmers.',
    url: '#',
    urgent: true,
    icon: TrendingUp
  },
  {
    id: 2,
    category: 'Schemes',
    title: 'PM-KISAN 19th Installment: ₹2,000 Directly Credited to 9.3 Crore Farmers',
    source: 'Ministry of Agriculture, GoI',
    date: '05 Sep 2026',
    description: 'The 19th installment of PM-KISAN was released by the Prime Minister. A total of ₹20,000 crore transferred directly to bank accounts of 9.3 crore farmer beneficiaries. Farmers can check status at pmkisan.gov.in.',
    url: '#',
    urgent: false,
    icon: Sprout
  },
  {
    id: 3,
    category: 'Weather Advisory',
    title: 'IMD Red Alert: Heavy Rainfall Warning for Konkan, Goa & Coastal Karnataka — 8–12 Sep',
    source: 'India Meteorological Department (IMD)',
    date: '07 Sep 2026',
    description: 'IMD has issued red alert for extremely heavy rainfall in Konkan coast, Goa and coastal Karnataka belt from 8–12 September. Farmers advised to harvest ready crops immediately, avoid spraying pesticides, and ensure proper drainage in fields.',
    url: '#',
    urgent: true,
    icon: CloudRain
  },
  {
    id: 4,
    category: 'Subsidies',
    title: 'PMFBY Crop Insurance: Last Date to Enroll for Kharif Season Extended to 15 Sep 2026',
    source: 'Agriculture Insurance Company of India',
    date: '04 Sep 2026',
    description: 'Under Pradhan Mantri Fasal Bima Yojana (PMFBY), the deadline for enrollment for Kharif 2026 has been extended to 15 September 2026. Premium for food crops is 2%, oilseeds 2%, and horticulture/commercial 5% of sum insured.',
    url: '#',
    urgent: false,
    icon: BookOpen
  },
  {
    id: 5,
    category: 'Policy',
    title: 'New Agriculture Export Policy 2026: Onion, Wheat Export Restrictions Eased',
    source: 'DGFT — Ministry of Commerce',
    date: '03 Sep 2026',
    description: 'The government has eased export restrictions on wheat and non-basmati white rice effective September 2026. Onion export floor price removed. These decisions aim to help farmers get better prices for surplus produce in international markets.',
    url: '#',
    urgent: false,
    icon: TrendingUp
  },
  {
    id: 6,
    category: 'Schemes',
    title: 'Kisan Credit Card (KCC) Campaign: Banks to Issue 1 Crore New KCC in 3 Months',
    source: 'NABARD / Finance Ministry',
    date: '02 Sep 2026',
    description: 'NABARD and Finance Ministry launch a special drive to issue 1 crore Kisan Credit Cards to allied sector farmers including fishermen, dairy farmers and poultry farmers. KCC provides revolving credit at 7% interest for agricultural operations.',
    url: '#',
    urgent: false,
    icon: BookOpen
  },
  {
    id: 7,
    category: 'Weather Advisory',
    title: 'Pest Alert: Fall Armyworm (Spodoptera frugiperda) Outbreak Reported in Maize Fields — MP & CG',
    source: 'Directorate of Plant Protection, GoI',
    date: '08 Sep 2026',
    description: 'Fall Armyworm outbreak detected in maize-growing regions of Madhya Pradesh and Chhattisgarh. NCIPM recommends application of Emamectin Benzoate 5 SG @ 0.4 g/litre or Chlorantraniliprole 18.5 SC @ 0.4 ml/litre for control.',
    url: '#',
    urgent: true,
    icon: AlertTriangle
  },
  {
    id: 8,
    category: 'MSP Rates',
    title: 'Rabi MSP 2026-27 Announced: Wheat at ₹2,425/Qtl — 5.2% Hike Over Last Year',
    source: 'CACP — Ministry of Agriculture',
    date: '01 Sep 2026',
    description: 'Commission for Agricultural Costs and Prices (CACP) has recommended and the Cabinet approved Rabi MSP for 2026-27. Wheat MSP set at ₹2,425/quintal, Barley ₹1,875, Gram ₹5,650, Lentil ₹6,700. Returns above cost of production assured at 50%+.',
    url: '#',
    urgent: false,
    icon: TrendingUp
  },
  {
    id: 9,
    category: 'Subsidies',
    title: 'Nano Urea 2.0 Launch: Liquid Fertiliser Available at ₹225 per 500ml Bottle',
    source: 'IFFCO / Ministry of Chemicals',
    date: '29 Aug 2026',
    description: 'IFFCO launches enhanced Nano Urea 2.0 with 8% higher nitrogen efficiency. Available at ₹225/bottle (500ml) across IFFCO outlets and e-commerce platforms. One bottle replaces one bag of conventional urea for foliar application.',
    url: '#',
    urgent: false,
    icon: Sprout
  },
  {
    id: 10,
    category: 'Policy',
    title: 'eNAM Platform: 1,361 APMC Mandis Now Integrated — ₹3.2 Lakh Crore in Cumulative Trade',
    source: 'Small Farmers Agribusiness Consortium (SFAC)',
    date: '28 Aug 2026',
    description: 'eNAM (Electronic National Agriculture Market) now integrates 1,361 mandis across 23 states and 4 UTs. Cumulative trade crosses ₹3.2 lakh crore since launch. Farmers can register free at enam.gov.in to sell produce online across mandis.',
    url: '#',
    urgent: false,
    icon: BookOpen
  },
  {
    id: 11,
    category: 'Schemes',
    title: 'Soil Health Card Scheme: New Portal Launched for Digital Soil Report Download',
    source: 'Ministry of Agriculture, GoI',
    date: '26 Aug 2026',
    description: 'Ministry launches upgraded Soil Health Portal (soilhealth.dac.gov.in) allowing farmers to download digital Soil Health Cards, view NPK recommendations for their district, and access crop-specific nutrient advisory in 12 regional languages.',
    url: '#',
    urgent: false,
    icon: Sprout
  },
  {
    id: 12,
    category: 'Weather Advisory',
    title: 'Southwest Monsoon 2026 Progress: All-India Seasonal Rainfall 106% of LPA — Excellent Kharif Outlook',
    source: 'India Meteorological Department (IMD)',
    date: '09 Sep 2026',
    description: 'IMD confirms that cumulative South-West Monsoon rainfall for 2026 is at 106% of Long Period Average (LPA) as of 9 September. Kharif sowing area is 10.8% higher than last year. Good rabi prospects expected with improved reservoir storage.',
    url: '#',
    urgent: false,
    icon: CloudRain
  },
];

const CATEGORIES = ['All News', 'MSP Rates', 'Schemes', 'Subsidies', 'Policy', 'Weather Advisory'];

const CATEGORY_STYLES = {
  'MSP Rates':        { bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',  dot: 'bg-emerald-500' },
  'Schemes':          { bg: 'bg-blue-100 text-blue-800 border-blue-200',            dot: 'bg-blue-500' },
  'Subsidies':        { bg: 'bg-amber-100 text-amber-800 border-amber-200',          dot: 'bg-amber-500' },
  'Policy':           { bg: 'bg-indigo-100 text-indigo-800 border-indigo-200',      dot: 'bg-indigo-500' },
  'Weather Advisory': { bg: 'bg-sky-100 text-sky-800 border-sky-200',               dot: 'bg-sky-500' },
};

export default function AgriNews() {
  const [activeCategory, setActiveCategory] = useState('All News');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    let data = [...NEWS_ITEMS];
    if (activeCategory !== 'All News') data = data.filter(n => n.category === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(n => n.title.toLowerCase().includes(q) || n.description.toLowerCase().includes(q) || n.source.toLowerCase().includes(q));
    }
    // Urgent items first
    data.sort((a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0));
    return data;
  }, [activeCategory, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* ── Page Header ── */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-emerald-900 rounded-3xl p-8 sm:p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-emerald-800/20 pointer-events-none" />
        <div className="absolute -bottom-12 left-10 w-40 h-40 rounded-full bg-amber-700/10 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[11px] font-bold mb-4">
              <Newspaper className="w-3.5 h-3.5" />
              Government Agriculture News & Advisories
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Agri News & Government Updates</h1>
            <p className="text-emerald-300 text-sm mt-2 font-medium max-w-xl">
              MSP announcements, crop insurance deadlines, subsidy schemes, weather advisories and agriculture policy updates — curated from PIB, IMD, and Ministry of Agriculture.
            </p>
          </div>
          <div className="flex flex-col items-center gap-2 bg-emerald-800/60 rounded-2xl border border-emerald-700/40 p-5 text-center shrink-0">
            <Bell className="w-6 h-6 text-amber-400" />
            <div className="text-xl font-black">{NEWS_ITEMS.length}</div>
            <div className="text-[11px] font-bold text-emerald-400 uppercase">Active Alerts</div>
          </div>
        </div>
      </div>

      {/* ── Filters Bar ── */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                activeCategory === cat
                  ? 'bg-emerald-900 text-white border-emerald-700 shadow-md'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-400 hover:text-emerald-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative sm:ml-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search news & advisories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-full border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none w-56"
          />
        </div>
      </div>

      {/* ── Results Count ── */}
      <div className="text-xs text-slate-500 font-medium">
        Showing <strong className="text-slate-900">{filtered.length}</strong> {activeCategory !== 'All News' ? activeCategory : ''} updates
      </div>

      {/* ── News Cards Grid ── */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center text-slate-400 italic text-sm border-2 border-dashed rounded-3xl">
          No news items match your search. Try clearing filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((news) => {
            const style = CATEGORY_STYLES[news.category] || CATEGORY_STYLES['Policy'];
            const Icon = news.icon;
            return (
              <article
                key={news.id}
                className={`bg-white rounded-3xl border shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group ${
                  news.urgent ? 'border-rose-200 ring-1 ring-rose-100' : 'border-slate-200'
                }`}
              >
                {/* Colored Top Strip */}
                <div className={`h-1.5 w-full ${style.dot}`} />
                
                <div className="p-6 flex flex-col flex-grow space-y-4">
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${style.bg}`}>
                        <Tag className="w-2.5 h-2.5" />
                        {news.category}
                      </span>
                      {news.urgent && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700 border border-rose-200 animate-pulse">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          URGENT
                        </span>
                      )}
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-emerald-700" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-extrabold text-slate-900 text-sm leading-snug group-hover:text-emerald-800 transition-colors">
                    {news.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed font-medium flex-grow">
                    {news.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="space-y-0.5">
                      <div className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider">{news.source}</div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                        <Calendar className="w-3 h-3" />
                        {news.date}
                      </div>
                    </div>
                    <a
                      href={news.url}
                      className="flex items-center gap-1 text-xs font-extrabold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors"
                    >
                      Read More
                      <ChevronRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ── Sources Footer ── */}
      <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-500 font-medium space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-slate-700 mb-2">
          <ExternalLink className="w-3.5 h-3.5" />
          Official Sources
        </div>
        <div className="flex flex-wrap gap-4">
          {['pib.gov.in', 'imd.gov.in', 'agricoop.nic.in', 'enam.gov.in', 'pmkisan.gov.in', 'agmarknet.gov.in'].map(src => (
            <a key={src} href={`https://${src}`} target="_blank" rel="noopener noreferrer"
               className="text-emerald-600 hover:text-emerald-800 font-semibold hover:underline">
              {src}
            </a>
          ))}
        </div>
      </div>

    </div>
  );
}
