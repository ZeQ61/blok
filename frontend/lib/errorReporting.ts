interface ErrorReport {
  message: string
  stack?: string
  timestamp: string
  url: string
  userAgent: string
  userId?: string
  context?: string
  severity: "low" | "medium" | "high" | "critical"
}

class ErrorReporter {
  private static instance: ErrorReporter
  private reports: ErrorReport[] = []
  private maxReports = 50

  private constructor() {
    this.setupGlobalErrorHandlers()
  }

  static getInstance(): ErrorReporter {
    if (!ErrorReporter.instance) {
      ErrorReporter.instance = new ErrorReporter()
    }
    return ErrorReporter.instance
  }

  private setupGlobalErrorHandlers() {
    if (typeof window !== "undefined") {
      // Handle unhandled JavaScript errors
      window.addEventListener("error", (event) => {
        this.reportError({
          message: event.message,
          stack: event.error?.stack,
          context: "Global Error Handler",
          severity: "high",
        })
      })

      // Handle unhandled promise rejections
      window.addEventListener("unhandledrejection", (event) => {
        this.reportError({
          message: `Unhandled Promise Rejection: ${event.reason}`,
          stack: event.reason?.stack,
          context: "Unhandled Promise Rejection",
          severity: "medium",
        })
      })
    }
  }

  reportError(error: {
    message: string
    stack?: string
    context?: string
    severity?: "low" | "medium" | "high" | "critical"
    userId?: string
  }) {
    const report: ErrorReport = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      url: typeof window !== "undefined" ? window.location.href : "",
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      userId: error.userId,
      context: error.context,
      severity: error.severity || "medium",
    }

    // Add to local reports
    this.reports.unshift(report)
    if (this.reports.length > this.maxReports) {
      this.reports = this.reports.slice(0, this.maxReports)
    }

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error Report:", report)
    }

    // Send to monitoring service (implement based on your service)
    this.sendToMonitoringService(report)
  }

  private async sendToMonitoringService(report: ErrorReport) {
    try {
      // Example: Send to your error monitoring service
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(report)
      // })

      // For now, just store in localStorage for debugging
      if (typeof localStorage !== "undefined") {
        const existingReports = JSON.parse(localStorage.getItem("errorReports") || "[]")
        existingReports.unshift(report)
        localStorage.setItem("errorReports", JSON.stringify(existingReports.slice(0, 20)))
      }
    } catch (error) {
      console.error("Failed to send error report:", error)
    }
  }

  getReports(): ErrorReport[] {
    return [...this.reports]
  }

  clearReports() {
    this.reports = []
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("errorReports")
    }
  }

  exportReports(): string {
    return JSON.stringify(this.reports, null, 2)
  }
}

export const errorReporter = ErrorReporter.getInstance()

// Utility functions for common error scenarios
export const handleApiError = (error: unknown, context: string) => {
  let message = "API request failed"
  let severity: "low" | "medium" | "high" | "critical" = "medium"

  if (error instanceof Error) {
    message = error.message
    if (error.message.includes("fetch")) {
      severity = "high"
    }
  }

  errorReporter.reportError({
    message,
    stack: error instanceof Error ? error.stack : undefined,
    context,
    severity,
  })
}

export const handleUserError = (message: string, context?: string) => {
  errorReporter.reportError({
    message,
    context: context || "User Action",
    severity: "low",
  })
}

export const handleCriticalError = (error: unknown, context: string) => {
  errorReporter.reportError({
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    context,
    severity: "critical",
  })
}
