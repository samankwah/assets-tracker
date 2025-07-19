/**
 * Monitoring and Error Tracking Service
 * Handles error reporting, performance monitoring, and analytics
 */

import { API_CONFIG } from "../config/apiConfig";

class MonitoringService {
  constructor() {
    this.isInitialized = false;
    this.sessionId = this.generateSessionId();
    this.userId = null;
    this.context = {};
    this.breadcrumbs = [];
    this.maxBreadcrumbs = 100;
  }

  /**
   * Initialize monitoring service
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      // Initialize Sentry if configured
      if (API_CONFIG.EXTERNAL.SENTRY_DSN) {
        await this.initializeSentry();
      }

      // Initialize Google Analytics if configured
      if (
        API_CONFIG.FEATURES.ANALYTICS &&
        API_CONFIG.EXTERNAL.GOOGLE_ANALYTICS_ID
      ) {
        this.initializeGoogleAnalytics();
      }

      // Initialize Hotjar if configured
      if (API_CONFIG.EXTERNAL.HOTJAR_ID) {
        this.initializeHotjar();
      }

      // Initialize Mixpanel if configured
      if (API_CONFIG.EXTERNAL.MIXPANEL_TOKEN) {
        this.initializeMixpanel();
      }

      // Set up global error handlers
      this.setupGlobalErrorHandlers();

      // Set up performance monitoring
      this.setupPerformanceMonitoring();

      this.isInitialized = true;
      console.log("🔍 Monitoring service initialized");
    } catch (error) {
      console.error("Failed to initialize monitoring service:", error);
    }
  }

  /**
   * Initialize Sentry error tracking
   */
  async initializeSentry() {
    try {
      const { init, configureScope } = await import("@sentry/react");

      init({
        dsn: API_CONFIG.EXTERNAL.SENTRY_DSN,
        environment: import.meta.env.MODE,
        integrations: [
          // Add browser integrations
        ],
        tracesSampleRate: API_CONFIG.DEBUG ? 1.0 : 0.1,
        beforeSend: (event) => {
          // Filter out development errors in production
          if (!API_CONFIG.DEBUG && event.exception) {
            const error = event.exception.values[0];
            if (error && error.value && error.value.includes("Script error")) {
              return null;
            }
          }
          return event;
        },
      });

      configureScope((scope) => {
        scope.setTag("sessionId", this.sessionId);
        scope.setContext("app", {
          version: import.meta.env.VITE_APP_VERSION || "1.0.0",
          buildId: import.meta.env.VITE_BUILD_ID || "development",
        });
      });

      console.log("✅ Sentry initialized");
    } catch (error) {
      console.error("Failed to initialize Sentry:", error);
    }
  }

  /**
   * Initialize Google Analytics
   */
  initializeGoogleAnalytics() {
    try {
      // Load gtag script
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${API_CONFIG.EXTERNAL.GOOGLE_ANALYTICS_ID}`;
      document.head.appendChild(script);

      // Initialize gtag
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };

      window.gtag("js", new Date());
      window.gtag("config", API_CONFIG.EXTERNAL.GOOGLE_ANALYTICS_ID, {
        custom_map: {
          custom_dimension_1: "user_type",
          custom_dimension_2: "session_id",
        },
      });

      console.log("✅ Google Analytics initialized");
    } catch (error) {
      console.error("Failed to initialize Google Analytics:", error);
    }
  }

  /**
   * Initialize Hotjar
   */
  initializeHotjar() {
    try {
      window.hj =
        window.hj ||
        function () {
          (window.hj.q = window.hj.q || []).push(arguments);
        };
      window._hjSettings = { hjid: API_CONFIG.EXTERNAL.HOTJAR_ID, hjsv: 6 };

      const script = document.createElement("script");
      script.async = true;
      script.src = `https://static.hotjar.com/c/hotjar-${API_CONFIG.EXTERNAL.HOTJAR_ID}.js?sv=6`;
      document.head.appendChild(script);

      console.log("✅ Hotjar initialized");
    } catch (error) {
      console.error("Failed to initialize Hotjar:", error);
    }
  }

  /**
   * Initialize Mixpanel
   */
  initializeMixpanel() {
    try {
      const script = document.createElement("script");
      script.src = "https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";
      script.onload = () => {
        window.mixpanel.init(API_CONFIG.EXTERNAL.MIXPANEL_TOKEN, {
          debug: API_CONFIG.DEBUG,
          track_pageview: true,
          persistence: "localStorage",
        });
      };
      document.head.appendChild(script);

      console.log("✅ Mixpanel initialized");
    } catch (error) {
      console.error("Failed to initialize Mixpanel:", error);
    }
  }

  /**
   * Set up global error handlers
   */
  setupGlobalErrorHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      this.captureException(event.reason, {
        type: "unhandledrejection",
        promise: event.promise,
      });
    });

    // Handle JavaScript errors
    window.addEventListener("error", (event) => {
      this.captureException(event.error, {
        type: "javascript_error",
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Handle resource loading errors
    window.addEventListener(
      "error",
      (event) => {
        if (event.target !== window) {
          this.captureMessage(
            `Resource failed to load: ${event.target.src || event.target.href}`,
            "warning"
          );
        }
      },
      true
    );
  }

  /**
   * Set up performance monitoring
   */
  setupPerformanceMonitoring() {
    // Monitor page load times
    window.addEventListener("load", () => {
      setTimeout(() => {
        const perfData = performance.timing;
        const loadTime = perfData.loadEventEnd - perfData.navigationStart;

        this.trackEvent("page_load_time", {
          load_time: loadTime,
          dom_ready_time:
            perfData.domContentLoadedEventEnd - perfData.navigationStart,
          first_paint_time: perfData.responseStart - perfData.navigationStart,
        });
      }, 0);
    });

    // Monitor Core Web Vitals
    if ("web-vital" in window) {
      import("web-vitals").then(
        ({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
          getCLS(this.sendWebVital.bind(this));
          getFID(this.sendWebVital.bind(this));
          getFCP(this.sendWebVital.bind(this));
          getLCP(this.sendWebVital.bind(this));
          getTTFB(this.sendWebVital.bind(this));
        }
      );
    }
  }

  /**
   * Send Web Vital metrics
   */
  sendWebVital(metric) {
    this.trackEvent("web_vital", {
      metric_name: metric.name,
      metric_value: metric.value,
      metric_id: metric.id,
      metric_delta: metric.delta,
    });
  }

  /**
   * Set user context
   */
  setUser(user) {
    this.userId = user.id;
    this.context.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    // Update Sentry context
    if (window.Sentry) {
      window.Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.name,
      });
    }

    // Update Google Analytics
    if (window.gtag) {
      window.gtag("config", API_CONFIG.EXTERNAL.GOOGLE_ANALYTICS_ID, {
        user_id: user.id,
      });
    }

    // Update Mixpanel
    if (window.mixpanel) {
      window.mixpanel.identify(user.id);
      window.mixpanel.people.set({
        $email: user.email,
        $name: user.name,
        role: user.role,
      });
    }
  }

  /**
   * Add breadcrumb
   */
  addBreadcrumb(message, category = "default", level = "info", data = {}) {
    const breadcrumb = {
      timestamp: new Date().toISOString(),
      message,
      category,
      level,
      data,
    };

    this.breadcrumbs.push(breadcrumb);

    // Keep only the last N breadcrumbs
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs.shift();
    }

    // Send to Sentry
    if (window.Sentry) {
      window.Sentry.addBreadcrumb(breadcrumb);
    }
  }

  /**
   * Capture exception
   */
  captureException(error, context = {}) {
    const errorData = {
      ...this.context,
      ...context,
      sessionId: this.sessionId,
      breadcrumbs: this.breadcrumbs.slice(-10), // Last 10 breadcrumbs
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    };

    // Log to console in development
    if (API_CONFIG.DEBUG) {
      console.error("🚨 Exception captured:", error, errorData);
    }

    // Send to Sentry
    if (window.Sentry) {
      window.Sentry.withScope((scope) => {
        Object.keys(errorData).forEach((key) => {
          scope.setExtra(key, errorData[key]);
        });
        window.Sentry.captureException(error);
      });
    }

    // Track in analytics
    this.trackEvent("error", {
      error_message: error.message || "Unknown error",
      error_type: error.name || "Error",
      error_stack: error.stack,
    });
  }

  /**
   * Capture message
   */
  captureMessage(message, level = "info", context = {}) {
    const messageData = {
      ...this.context,
      ...context,
      sessionId: this.sessionId,
      level,
      timestamp: new Date().toISOString(),
    };

    // Log to console in development
    if (API_CONFIG.DEBUG) {
      console.log(`📝 Message captured [${level}]:`, message, messageData);
    }

    // Send to Sentry
    if (window.Sentry) {
      window.Sentry.withScope((scope) => {
        scope.setLevel(level);
        Object.keys(messageData).forEach((key) => {
          scope.setExtra(key, messageData[key]);
        });
        window.Sentry.captureMessage(message);
      });
    }
  }

  /**
   * Track event
   */
  trackEvent(eventName, properties = {}) {
    const eventData = {
      ...properties,
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: new Date().toISOString(),
      page: window.location.pathname,
    };

    // Log to console in development
    if (API_CONFIG.DEBUG) {
      console.log(`📊 Event tracked: ${eventName}`, eventData);
    }

    // Send to Google Analytics
    if (window.gtag) {
      window.gtag("event", eventName, eventData);
    }

    // Send to Mixpanel
    if (window.mixpanel) {
      window.mixpanel.track(eventName, eventData);
    }

    // Add breadcrumb
    this.addBreadcrumb(`Event: ${eventName}`, "user", "info", eventData);
  }

  /**
   * Track page view
   */
  trackPageView(page, title) {
    const pageData = {
      page,
      title,
      sessionId: this.sessionId,
      userId: this.userId,
      timestamp: new Date().toISOString(),
    };

    // Send to Google Analytics
    if (window.gtag) {
      window.gtag("config", API_CONFIG.EXTERNAL.GOOGLE_ANALYTICS_ID, {
        page_title: title,
        page_location: window.location.href,
      });
    }

    // Send to Mixpanel
    if (window.mixpanel) {
      window.mixpanel.track("Page View", pageData);
    }

    // Add breadcrumb
    this.addBreadcrumb(`Page view: ${page}`, "navigation", "info", pageData);
  }

  /**
   * Generate session ID
   */
  generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get monitoring status
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      sessionId: this.sessionId,
      userId: this.userId,
      breadcrumbsCount: this.breadcrumbs.length,
      services: {
        sentry: !!window.Sentry,
        googleAnalytics: !!window.gtag,
        hotjar: !!window.hj,
        mixpanel: !!window.mixpanel,
      },
    };
  }
}

// Create singleton instance
const monitoringService = new MonitoringService();

export default monitoringService;
export { MonitoringService };
