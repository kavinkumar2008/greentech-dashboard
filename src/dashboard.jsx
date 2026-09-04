import React, { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar
} from "recharts";
import {
  Search, Layers, Droplet, Sprout, Mountain, Waves,
  ChevronDown, MapPin, SlidersHorizontal
} from "lucide-react";

// ---------------------------------------------------------------------------
// Mock data — swap these for real Sentinel-2 / GEE / ESA WorldCover responses
// ---------------------------------------------------------------------------

const ndviTrend = [
  { month: "Jan", ndvi: 0.41 }, { month: "Feb", ndvi: 0.44 },
  { month: "Mar", ndvi: 0.52 }, { month: "Apr", ndvi: 0.61 },
  { month: "May", ndvi: 0.68 }, { month: "Jun", ndvi: 0.71 },
  { month: "Jul", ndvi: 0.69 }, { month: "Aug", ndvi: 0.63 },
  { month: "Sep", ndvi: 0.57 }, { month: "Oct", ndvi: 0.49 },
  { month: "Nov", ndvi: 0.43 }, { month: "Dec", ndvi: 0.40 },
];

const landUse = [
  { name: "Forest", value: 38, color: "#4C7A5E" },
  { name: "Agriculture", value: 29, color: "#B08256" },
  { name: "Urban", value: 18, color: "#8A6FA0" },
  { name: "Water", value: 15, color: "#4A7FA7" },
];

const waterBySector = [
  { sector: "Agriculture", pct: 62 },
  { sector: "Domestic", pct: 24 },
  { sector: "Industrial", pct: 14 },
];

const regions = [
  { id: "R-1042", name: "Kaveri Basin North", lat: 11.02, lng: 76.94, landUse: "Agriculture", ndvi: 0.58, water: 71 },
  { id: "R-1043", name: "Nilgiri Ridge", lat: 11.41, lng: 76.70, landUse: "Forest", ndvi: 0.74, water: 12 },
  { id: "R-1044", name: "Coimbatore Urban Belt", lat: 11.00, lng: 76.96, landUse: "Urban", ndvi: 0.21, water: 88 },
  { id: "R-1045", name: "Bhavani Confluence", lat: 11.45, lng: 77.68, landUse: "Water", ndvi: 0.33, water: 95 },
  { id: "R-1046", name: "Palakkad Gap", lat: 10.78, lng: 76.65, landUse: "Agriculture", ndvi: 0.61, water: 68 },
  { id: "R-1047", name: "Anamalai Foothills", lat: 10.35, lng: 77.15, landUse: "Forest", ndvi: 0.79, water: 9 },
];

const landUseIcon = {
  Forest: Sprout,
  Agriculture: Mountain,
  Urban: Layers,
  Water: Waves,
};

// ---------------------------------------------------------------------------

function KpiCard({ label, value, unit, accent, Icon, sub }) {
  return (
    <div className="kpi-card">
      <div className="kpi-top">
        <span className="kpi-label">{label}</span>
        <Icon size={16} strokeWidth={1.75} style={{ color: accent }} />
      </div>
      <div className="kpi-value">
        {value}
        <span className="kpi-unit">{unit}</span>
      </div>
      <div className="kpi-sub" style={{ color: accent }}>{sub}</div>
    </div>
  );
}

export default function GreenTechDashboard() {
  const [query, setQuery] = useState("");
  const [activeLayer, setActiveLayer] = useState("NDVI");
  const [selectedRegion, setSelectedRegion] = useState(regions[0]);

  const filteredRegions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return regions;
    return regions.filter(
      (r) => r.name.toLowerCase().includes(q) || r.landUse.toLowerCase().includes(q) || r.id.toLowerCase().includes(q)
    );
  }, [query]);

  const layers = ["NDVI", "NDWI", "Land Use"];

  return (
    <div className="gt-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500;600&family=Inter:wght@400;500;600&display=swap');
        .gt-root {
          --bg: #101913;
          --panel: #16211A;
          --panel-raised: #1C2A22;
          --line: #2A3A30;
          --sand: #EAE4D3;
          --muted: #8FA396;
          --moss: #4C7A5E;
          --moss-soft: #6FA083;
          --clay: #B08256;
          --water: #4A7FA7;
          --violet: #8A6FA0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: var(--bg);
          color: var(--sand);
          min-height: 100vh;
          display: flex;
          font-size: 14px;
        }
        .gt-root * { box-sizing: border-box; }
        .gt-serif { font-family: 'Fraunces', Georgia, serif; }

        /* Sidebar */
        .gt-sidebar {
          width: 72px;
          background: var(--panel);
          border-right: 1px solid var(--line);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px 0;
          gap: 28px;
          flex-shrink: 0;
        }
        .gt-mark {
          width: 34px; height: 34px;
          border-radius: 9px;
          background: linear-gradient(155deg, var(--moss) 0%, #2E4A3A 100%);
          display: flex; align-items: center; justify-content: center;
        }
        .gt-nav { display: flex; flex-direction: column; gap: 6px; }
        .gt-nav-item {
          width: 40px; height: 40px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 8px;
          color: var(--muted);
          cursor: pointer;
        }
        .gt-nav-item.active { background: var(--panel-raised); color: var(--moss-soft); }

        /* Main */
        .gt-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
        .gt-header {
          padding: 22px 32px 18px 32px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          border-bottom: 1px solid var(--line);
        }
        .gt-title { font-size: 22px; font-weight: 500; letter-spacing: -0.01em; }
        .gt-title-sub { color: var(--muted); font-size: 13px; margin-top: 4px; }
        .gt-search {
          display: flex; align-items: center; gap: 8px;
          background: var(--panel);
          border: 1px solid var(--line);
          border-radius: 8px;
          padding: 9px 12px;
          width: 280px;
        }
        .gt-search input {
          background: transparent; border: none; outline: none;
          color: var(--sand); font-size: 13px; width: 100%;
        }
        .gt-search input::placeholder { color: var(--muted); }

        .gt-body { padding: 24px 32px 32px 32px; display: flex; flex-direction: column; gap: 20px; }

        /* KPI row */
        .kpi-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        .kpi-card {
          background: var(--panel);
          border: 1px solid var(--line);
          border-radius: 10px;
          padding: 16px 18px;
        }
        .kpi-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .kpi-label { color: var(--muted); font-size: 12.5px; }
        .kpi-value { font-size: 26px; font-weight: 500; font-family: 'Fraunces', Georgia, serif; }
        .kpi-unit { font-size: 13px; color: var(--muted); margin-left: 3px; }
        .kpi-sub { font-size: 12px; margin-top: 6px; }

        /* Content grid: map + right rail */
        .gt-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 18px; align-items: start; }

        .map-panel {
          background: var(--panel);
          border: 1px solid var(--line);
          border-radius: 12px;
          overflow: hidden;
          position: relative;
        }
        .map-canvas {
          height: 420px;
          position: relative;
          background:
            radial-gradient(circle at 30% 25%, #2E4A3A 0%, transparent 45%),
            radial-gradient(circle at 70% 65%, #274357 0%, transparent 50%),
            radial-gradient(circle at 55% 20%, #5A4530 0%, transparent 40%),
            #182720;
        }
        .map-pin {
          position: absolute;
          width: 9px; height: 9px;
          border-radius: 50%;
          border: 2px solid var(--bg);
          cursor: pointer;
          transform: translate(-50%, -50%);
        }
        .map-pin.selected { width: 13px; height: 13px; box-shadow: 0 0 0 4px rgba(111,160,131,0.25); }

        .map-legend {
          position: absolute; left: 16px; bottom: 16px;
          background: rgba(16,25,19,0.85);
          border: 1px solid var(--line);
          border-radius: 8px;
          padding: 10px 12px;
          backdrop-filter: blur(4px);
        }
        .map-legend-title { font-size: 11px; color: var(--muted); margin-bottom: 8px; }
        .map-legend-row { display: flex; align-items: center; gap: 7px; font-size: 12px; margin-bottom: 5px; }
        .map-legend-row:last-child { margin-bottom: 0; }
        .swatch { width: 9px; height: 9px; border-radius: 2px; flex-shrink: 0; }

        .map-layers {
          position: absolute; top: 16px; right: 16px;
          background: rgba(16,25,19,0.85);
          border: 1px solid var(--line);
          border-radius: 8px;
          padding: 5px;
          display: flex; gap: 3px;
          backdrop-filter: blur(4px);
        }
        .layer-btn {
          border: none; background: transparent; color: var(--muted);
          font-size: 11.5px; padding: 6px 10px; border-radius: 6px; cursor: pointer;
        }
        .layer-btn.active { background: var(--moss); color: #0E1712; font-weight: 600; }

        .map-footer {
          padding: 12px 18px;
          border-top: 1px solid var(--line);
          display: flex; align-items: center; justify-content: space-between;
          font-size: 12.5px; color: var(--muted);
        }
        .map-footer strong { color: var(--sand); font-weight: 500; }

        /* Right rail */
        .rail { display: flex; flex-direction: column; gap: 18px; }
        .panel {
          background: var(--panel);
          border: 1px solid var(--line);
          border-radius: 12px;
          padding: 18px;
        }
        .panel-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 4px; }
        .panel-title { font-size: 13.5px; font-weight: 600; }
        .panel-note { font-size: 11.5px; color: var(--muted); margin-bottom: 10px; }

        .donut-wrap { display: flex; align-items: center; gap: 16px; }
        .donut-legend { display: flex; flex-direction: column; gap: 8px; font-size: 12.5px; }
        .donut-legend-row { display: flex; align-items: center; gap: 7px; }
        .donut-legend-pct { margin-left: auto; color: var(--muted); font-variant-numeric: tabular-nums; }

        .bar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
        .bar-row:last-child { margin-bottom: 0; }
        .bar-label { width: 76px; font-size: 12px; color: var(--muted); flex-shrink: 0; }
        .bar-track { flex: 1; height: 8px; background: var(--panel-raised); border-radius: 4px; overflow: hidden; }
        .bar-fill { height: 100%; border-radius: 4px; background: var(--water); }
        .bar-pct { width: 34px; text-align: right; font-size: 12px; font-variant-numeric: tabular-nums; }

        /* Table */
        .table-panel {
          background: var(--panel);
          border: 1px solid var(--line);
          border-radius: 12px;
          overflow: hidden;
        }
        .table-head {
          padding: 16px 20px;
          display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1px solid var(--line);
        }
        table { width: 100%; border-collapse: collapse; }
        thead th {
          text-align: left; font-size: 11px; color: var(--muted);
          font-weight: 500; text-transform: none;
          padding: 10px 20px; border-bottom: 1px solid var(--line);
        }
        tbody td { padding: 12px 20px; font-size: 13px; border-bottom: 1px solid var(--line); }
        tbody tr:last-child td { border-bottom: none; }
        tbody tr { cursor: pointer; }
        tbody tr:hover { background: var(--panel-raised); }
        .tag {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 9px; border-radius: 20px; font-size: 11.5px;
          background: var(--panel-raised);
        }
        .mono-coord { color: var(--muted); font-variant-numeric: tabular-nums; }

        @media (max-width: 880px) {
          .kpi-row { grid-template-columns: repeat(2, 1fr); }
          .gt-grid { grid-template-columns: 1fr; }
          .gt-sidebar { display: none; }
        }
      `}</style>

      {/* Sidebar */}
      <div className="gt-sidebar">
        <div className="gt-mark">
          <Sprout size={18} color="#EAE4D3" strokeWidth={1.75} />
        </div>
        <div className="gt-nav">
          <div className="gt-nav-item active"><Layers size={18} strokeWidth={1.75} /></div>
          <div className="gt-nav-item"><Sprout size={18} strokeWidth={1.75} /></div>
          <div className="gt-nav-item"><Droplet size={18} strokeWidth={1.75} /></div>
          <div className="gt-nav-item"><SlidersHorizontal size={18} strokeWidth={1.75} /></div>
        </div>
      </div>

      {/* Main */}
      <div className="gt-main">
        <div className="gt-header">
          <div>
            <div className="gt-title gt-serif">GreenTech Analytics</div>
            <div className="gt-title-sub">Vegetation, land use &amp; water metrics · Tamil Nadu region</div>
          </div>
          <div className="gt-search">
            <Search size={15} color="#8FA396" />
            <input
              placeholder="Search region, coordinates, or land-use type…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="gt-body">
          {/* KPI row */}
          <div className="kpi-row">
            <KpiCard label="Vegetation Health (NDVI)" value={selectedRegion.ndvi.toFixed(2)} unit="index" accent="#6FA083" Icon={Sprout} sub={selectedRegion.ndvi > 0.5 ? "Healthy canopy cover" : "Sparse cover"} />
            <KpiCard label="Land Use Type" value={selectedRegion.landUse} unit="" accent="#B08256" Icon={Mountain} sub={selectedRegion.name} />
            <KpiCard label="Water Usage" value={selectedRegion.water} unit="%" accent="#4A7FA7" Icon={Droplet} sub={selectedRegion.water > 70 ? "High demand" : "Moderate demand"} />
            <KpiCard label="Soil Moisture" value={(28 + (selectedRegion.ndvi * 30)).toFixed(0)} unit="%" accent="#8A6FA0" Icon={Waves} sub="Rootzone, 0–30cm" />
          </div>

          <div className="gt-grid">
            {/* Map */}
            <div className="map-panel">
              <div className="map-canvas">
                {regions.map((r) => {
                  const x = ((r.lng - 76.5) / (77.8 - 76.5)) * 100;
                  const y = ((11.6 - r.lat) / (11.6 - 10.3)) * 100;
                  const color = landUse.find((l) => l.name === r.landUse)?.color || "#6FA083";
                  return (
                    <div
                      key={r.id}
                      className={`map-pin${r.id === selectedRegion.id ? " selected" : ""}`}
                      style={{ left: `${x}%`, top: `${y}%`, background: color }}
                      onClick={() => setSelectedRegion(r)}
                      title={r.name}
                    />
                  );
                })}
                <div className="map-layers">
                  {layers.map((l) => (
                    <button
                      key={l}
                      className={`layer-btn${activeLayer === l ? " active" : ""}`}
                      onClick={() => setActiveLayer(l)}
                    >
                      {l}
                    </button>
                  ))}
                </div>
                <div className="map-legend">
                  <div className="map-legend-title">Land use</div>
                  {landUse.map((l) => (
                    <div className="map-legend-row" key={l.name}>
                      <span className="swatch" style={{ background: l.color }} />
                      {l.name}
                    </div>
                  ))}
                </div>
              </div>
              <div className="map-footer">
                <span><MapPin size={12} style={{ verticalAlign: -1, marginRight: 4 }} />{selectedRegion.name} · {selectedRegion.lat.toFixed(2)}, {selectedRegion.lng.toFixed(2)}</span>
                <span>Viewing <strong>{activeLayer}</strong> layer</span>
              </div>
            </div>

            {/* Right rail */}
            <div className="rail">
              <div className="panel">
                <div className="panel-head">
                  <span className="panel-title">Vegetation index — 12 months</span>
                </div>
                <div className="panel-note">NDVI trend, regional average</div>
                <div style={{ height: 140 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={ndviTrend} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                      <CartesianGrid stroke="#2A3A30" vertical={false} />
                      <XAxis dataKey="month" tick={{ fill: "#8FA396", fontSize: 10.5 }} axisLine={{ stroke: "#2A3A30" }} tickLine={false} />
                      <YAxis tick={{ fill: "#8FA396", fontSize: 10.5 }} axisLine={false} tickLine={false} domain={[0, 1]} />
                      <Tooltip
                        contentStyle={{ background: "#1C2A22", border: "1px solid #2A3A30", borderRadius: 8, fontSize: 12 }}
                        labelStyle={{ color: "#EAE4D3" }}
                      />
                      <Line type="monotone" dataKey="ndvi" stroke="#6FA083" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="panel">
                <div className="panel-head">
                  <span className="panel-title">Land-use distribution</span>
                </div>
                <div className="panel-note">Share of monitored area</div>
                <div className="donut-wrap">
                  <div style={{ width: 110, height: 110, flexShrink: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={landUse} dataKey="value" nameKey="name" innerRadius={32} outerRadius={50} stroke="none">
                          {landUse.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="donut-legend">
                    {landUse.map((l) => (
                      <div className="donut-legend-row" key={l.name}>
                        <span className="swatch" style={{ background: l.color }} />
                        {l.name}
                        <span className="donut-legend-pct">{l.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="panel">
                <div className="panel-head">
                  <span className="panel-title">Water use by sector</span>
                </div>
                <div className="panel-note">% of total regional draw</div>
                {waterBySector.map((w) => (
                  <div className="bar-row" key={w.sector}>
                    <span className="bar-label">{w.sector}</span>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${w.pct}%` }} />
                    </div>
                    <span className="bar-pct">{w.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="table-panel">
            <div className="table-head">
              <span className="panel-title">Monitored regions</span>
              <span className="panel-note" style={{ marginBottom: 0 }}>{filteredRegions.length} of {regions.length} shown</span>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Region</th>
                  <th>Coordinates</th>
                  <th>Land use</th>
                  <th>NDVI</th>
                  <th>Water use</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegions.map((r) => {
                  const Icon = landUseIcon[r.landUse];
                  const color = landUse.find((l) => l.name === r.landUse)?.color;
                  return (
                    <tr key={r.id} onClick={() => setSelectedRegion(r)}>
                      <td>{r.name}<div className="mono-coord" style={{ fontSize: 11 }}>{r.id}</div></td>
                      <td className="mono-coord">{r.lat.toFixed(2)}, {r.lng.toFixed(2)}</td>
                      <td>
                        <span className="tag" style={{ color }}>
                          <Icon size={12} strokeWidth={2} />
                          {r.landUse}
                        </span>
                      </td>
                      <td>{r.ndvi.toFixed(2)}</td>
                      <td>{r.water}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
