// PumpGuardProcess.jsx
import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import './PumpGuardProcess.css';

const PumpGuardProcess = () => {
  const [activeMarker, setActiveMarker] = useState(0);
  const [collectionLogs, setCollectionLogs] = useState([
    { time: '12:05:01', message: '✓ Collected 142 swap events from Polygon', type: 'success' },
    { time: '12:04:01', message: '✓ Collected 128 swap events from Polygon', type: 'success' },
    { time: '12:03:01', message: '✓ Collected 156 swap events from Polygon', type: 'success' },
    { time: '12:02:01', message: '✓ Collected 119 swap events from Polygon', type: 'success' },
    { time: '12:01:01', message: '✓ Collected 135 swap events from Polygon', type: 'success' },
  ]);

  const [analysisLogs, setAnalysisLogs] = useState([
    { time: '12:05:00', message: '⚠ Suspicious activity detected: QUICK/USDT', type: 'warning' },
    { time: '12:00:00', message: '✓ Analyzed 680 swap events from last 5 minutes', type: 'info' },
    { time: '11:55:00', message: '✓ Analyzed 712 swap events from last 5 minutes', type: 'info' },
    { time: '11:50:00', message: '⚠ Abnormal volume spike: MATIC/USDC', type: 'warning' },
    { time: '11:45:00', message: '✓ Analyzed 654 swap events from last 5 minutes', type: 'info' },
  ]);

  // Timeline animation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMarker((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Simulate live activity
  useEffect(() => {
    const collectionMessages = [
      '✓ Collected swap events from Polygon',
      '✓ Processed transaction data',
      '✓ Stored swap records in database'
    ];

    const analysisMessages = [
      '✓ Analyzed trading patterns',
      '⚠ Detected potential manipulation',
      '✓ Generated risk assessment',
      '⚠ Abnormal volume increase detected'
    ];

    const interval = setInterval(() => {
      const now = new Date();
      const timeString = now.toTimeString().split(' ')[0];

      // Add collection log
      const newCollectionLog = {
        time: timeString,
        message: collectionMessages[Math.floor(Math.random() * collectionMessages.length)],
        type: 'success'
      };

      setCollectionLogs(prev => [newCollectionLog, ...prev.slice(0, 4)]);

      // Add analysis log every 30 seconds
      if (now.getSeconds() % 30 === 0) {
        const message = analysisMessages[Math.floor(Math.random() * analysisMessages.length)];
        const newAnalysisLog = {
          time: timeString,
          message: message,
          type: message.startsWith('⚠') ? 'warning' : 'info'
        };

        setAnalysisLogs(prev => [newAnalysisLog, ...prev.slice(0, 4)]);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pumpguard-process mt-32">

      {/* <Hero /> */}
      <ProcessVisualization
        activeMarker={activeMarker}
        collectionLogs={collectionLogs}
        analysisLogs={analysisLogs}
      />
      <Footer />
    </div>
  );
};



// Hero Section Component
const Hero = () => (
  <section className="hero">
    <div className="process-container">
      <h1>How PumpGuard AI Works Behind the Scenes</h1>
      <p>Real-time monitoring, analysis, and alerting system for detecting pump and dump schemes on Polygon</p>
    </div>
  </section>
);

// Process Visualization Component
const ProcessVisualization = ({ activeMarker, collectionLogs, analysisLogs }) => (
  <section className="process-visualization">
    <div className="process-container">
      <h2 className="process-title">System Process Flow<span></span></h2>

      <Timeline activeMarker={activeMarker} />
      <ProcessFlow />
      <DataFlow />
      <LiveActivity
        collectionLogs={collectionLogs}
        analysisLogs={analysisLogs}
      />
    </div>
  </section>
);

// Timeline Component
const Timeline = ({ activeMarker }) => (
  <div className="timeline">
    {[0, 1, 2].map((index) => (
      <div
        key={index}
        className={`timeline-marker ${activeMarker === index ? 'active' : ''}`}
      >
        <span>{index === 0 ? '1m' : index === 1 ? '5m' : 'Live'}</span>
        <div className="timeline-label">
          {index === 0 ? 'Data Collection' : index === 1 ? 'Analysis' : 'Dashboard'}
        </div>
      </div>
    ))}
  </div>
);

// Process Flow Component
const ProcessFlow = () => {
  const steps = [
    {
      icon: 'fas fa-cloud-download-alt',
      title: 'Data Collection',
      desc: 'Every minute, we query Polygon for swap events',
      details: [
        'Request swap data via eth_getLogs',
        'Filter QuickSwap pair transactions',
        'Parse and decode swap logs',
        'Store raw transaction data'
      ]
    },
    {
      icon: 'fas fa-chart-line',
      title: 'Data Analysis',
      desc: 'Every 5 minutes, we analyze collected data',
      details: [
        'Calculate price and volume changes',
        'Identify abnormal trading patterns',
        'Detect potential pump & dump signals',
        'Generate risk scores for pairs'
      ]
    },
    {
      icon: 'fas fa-tachometer-alt',
      title: 'Dashboard Display',
      desc: 'Real-time visualization of analysis results',
      details: [
        'Show suspicious activity alerts',
        'Display trading pair analytics',
        'Provide historical data charts',
        'Enable API access to results'
      ]
    }
  ];

  return (
    <div className="process-flow">
      {steps.map((step, index) => (
        <ProcessStep key={index} {...step} />
      ))}
    </div>
  );
};

// Individual Process Step Component
const ProcessStep = ({ icon, title, desc, details }) => (
  <div className="process-step">
    <div className="step-icon">
      <i className={icon}></i>
    </div>
    <h3 className="step-title">{title}</h3>
    <p className="step-desc">{desc}</p>
    <div className="step-details">
      <ul>
        {details.map((detail, index) => (
          <li key={index}>
            <i className="fas fa-check"></i>
            {detail}
          </li>
        ))}
      </ul>
    </div>
  </div>
);

// Data Flow Component
const DataFlow = () => {
  const nodes = [
    { icon: 'fab fa-brands fa-nfc-symbol', label: 'Polygon Network', className: 'node-polygon' },
    { icon: 'fas fa-database', label: 'Data Storage', className: 'node-database' },
    { icon: 'fas fa-brain', label: 'Analysis Engine', className: 'node-analysis' },
    { icon: 'fas fa-tv', label: 'User Dashboard', className: 'node-dashboard' }
  ];

  return (
    <div className="data-flow">
      <h3 className="flow-title">Real-time Data Flow</h3>
      <div className="flow-container">
      {/* <div className={`flow-node node-polygon`}>
        <div className="node-icon">
          <img src="picon.svg" />
        </div>
        <div className="node-label text-sm">Polygon Network</div>
      </div> */}


        {nodes.map((node, index) => (
          <React.Fragment key={index}>
            <FlowNode {...node} />
            {index < nodes.length - 1 && (
              <div
                className="flow-arrow"
                style={{ left: `${15 + index * 30}%`, width: '10%' }}
              ></div>
            )}
          </React.Fragment>
        ))}
        <AnimatedDataPoints />
      </div>
    </div>
  );
};

// Flow Node Component
const FlowNode = ({ icon, label, className }) => (
  <div className={`flow-node ${className}`}>
    <div className="node-icon">
      <i className={icon}></i>
    </div>
    <div className="node-label text-sm">{label}</div>
  </div>
);

// Animated Data Points Component
const AnimatedDataPoints = () => {
  useEffect(() => {
    const dataPoints = document.querySelectorAll('.flow-data');
    dataPoints.forEach((point, index) => {
      const topPos = 20 + Math.random() * 60;
      point.style.top = `${topPos}%`;
      point.style.animation = `moveData 4s linear ${index * 1.5}s infinite`;
    });
  }, []);

  return (
    <>
      <div className="flow-data"></div>
      <div className="flow-data"></div>
      <div className="flow-data"></div>
    </>
  );
};

// Live Activity Component
const LiveActivity = ({ collectionLogs, analysisLogs }) => (
  <div className="live-activity">
    <h3 className="activity-title">Live System Activity</h3>
    <div className="activity-container">
      <ActivityPanel
        title="Data Collection Log"
        logs={collectionLogs}
      />
      <ActivityPanel
        title="Analysis Results"
        logs={analysisLogs}
      />
    </div>
  </div>
);

// Activity Panel Component
const ActivityPanel = ({ title, logs }) => (
  <div className="activity-panel">
    <h4 className="panel-title">
      <span className="live-indicator"></span>
      {title}
    </h4>
    <div className="activity-log">
      {logs.map((log, index) => (
        <LogEntry key={index} {...log} />
      ))}
    </div>
  </div>
);

// Log Entry Component
const LogEntry = ({ time, message, type }) => (
  <div className="log-entry">
    <span className="log-time">{time}</span>
    <span className={`log-message ${type}`}>{message}</span>
  </div>
);

// Footer Component
const Footer = () => (
  <footer>
    <div className="process-container">
      <div className="logo">
        <div className="logo-icon">
          {/* <i className="fas fa-shield-alt"></i> */}
          <Activity className="w-8 h-8 mx-auto text-white" />
        </div>
        PumpGuard AI
      </div>

      <div className="footer-links">
        <a href="#" className="footer-link">Documentation</a>
        <a href="#" className="footer-link">API Reference</a>
        <a href="#" className="footer-link">GitHub</a>
        <a href="#" className="footer-link">Contact</a>
      </div>

      <p className="copyright">© 2025 PumpGuard AI. All rights reserved.</p>
    </div>
  </footer>
);

export default PumpGuardProcess;