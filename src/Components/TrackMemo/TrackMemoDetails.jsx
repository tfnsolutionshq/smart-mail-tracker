import React, { useState } from "react";
import {
  FiArrowLeft,
  FiCopy,
  FiClock,
  FiCheck,
  FiMapPin,
  FiUser,
  FiFileText,
  FiAlertCircle,
} from "react-icons/fi";

function TrackMemoDetails({ onBack, memoData }) {
  const [copied, setCopied] = useState(false);

  const normalizeDepartment = (dept) => {
    if (!dept) return "No department";
    const trimmed = String(dept).trim();
    if (trimmed === "Unknown" || trimmed.toLowerCase() === "office")
      return "No department";
    return dept;
  };
  const normalizeUser = (name) => (!name || name === "Unknown" ? null : name);
  const formatTimelineDate = (ds) => {
    if (!ds) return "—";
    const d = new Date(ds);
    if (isNaN(d)) return ds;
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const buildTimelineEntry = (item, index, arr) => {
    const action = item.action || "Update";
    const lowered = String(action).toLowerCase();
    const userName = normalizeUser(item.user_name);
    const assignedBy = normalizeUser(item.assigned_by);
    const assignedTo = normalizeUser(item.assigned_to);
    const forwardedBy = normalizeUser(item.forwarded_by);
    const forwardedTo = normalizeUser(item.forwarded_to);
    const acknowledgedBy = normalizeUser(
      item.acknowledged_by || item.completed_by,
    );
    const assignedByDept = normalizeDepartment(item.assigned_by_department);
    const assignedToDept = normalizeDepartment(item.assigned_to_department);
    const forwardedByDept = normalizeDepartment(item.forwarded_by_department);
    const forwardedToDept = normalizeDepartment(item.forwarded_to_department);
    const dept = normalizeDepartment(item.department);

    let subtitle = null;
    if (lowered === "assigned") {
      subtitle = `${assignedByDept} → ${assignedToDept}`;
    } else if (lowered === "forwarded") {
      subtitle = `${forwardedByDept} → ${forwardedToDept}`;
    } else if (lowered === "recorded" && item.department) {
      subtitle = dept;
    }

    let description = action;
    if (lowered === "recorded") {
      description = userName
        ? `Recorded by ${userName} in ${dept}`
        : `Recorded in ${dept}`;
    } else if (lowered === "assigned") {
      description =
        assignedBy && assignedTo
          ? `Assigned by ${assignedBy} to ${assignedTo}`
          : assignedBy
            ? `Assigned by ${assignedBy}`
            : assignedTo
              ? `Assigned to ${assignedTo}`
              : "Assigned";
    } else if (lowered === "forwarded") {
      description =
        forwardedBy && forwardedTo
          ? `Forwarded by ${forwardedBy} to ${forwardedTo}`
          : forwardedBy
            ? `Forwarded by ${forwardedBy}`
            : forwardedTo
              ? `Forwarded to ${forwardedTo}`
              : "Forwarded";
    } else {
      const performer =
        userName || acknowledgedBy || assignedTo || forwardedTo || null;
      const who = performer ? `${action} by ${performer}` : action;
      const parts = [who];
      if (dept && dept !== "No department") parts.push(`Department: ${dept}`);
      if (assignedBy || assignedTo)
        parts.push(`Assigned: ${assignedBy || "—"} → ${assignedTo || "—"}`);
      if (forwardedBy || forwardedTo)
        parts.push(`Forwarded: ${forwardedBy || "—"} → ${forwardedTo || "—"}`);
      description = parts.join(" • ");
    }

    return {
      id: index + 1,
      title: action,
      subtitle,
      date: formatTimelineDate(item.date_time),
      description,
      status: index === arr.length - 1 ? "current" : "completed",
    };
  };

  const lastTimelineEntry =
    memoData.movement_timeline?.[memoData.movement_timeline.length - 1];

  const rawCurrentDepartment =
    lastTimelineEntry?.assigned_to_department ||
    lastTimelineEntry?.forwarded_to_department ||
    lastTimelineEntry?.department ||
    null;
  const isOfficeDepartment =
    typeof rawCurrentDepartment === "string" &&
    rawCurrentDepartment.trim().toLowerCase() === "office";

  const normOfficerValue = (val) => (!val || val === "Unknown" ? null : val);
  const currentOfficerName =
    normOfficerValue(memoData.assigned_to?.name) ||
    normOfficerValue(lastTimelineEntry?.assigned_to) ||
    normOfficerValue(lastTimelineEntry?.assigned_to_name) ||
    normOfficerValue(memoData.assigned_officer?.name) ||
    normOfficerValue(memoData.current_officer?.name) ||
    null;
  const currentOfficerEmail =
    normOfficerValue(memoData.assigned_to?.email) ||
    normOfficerValue(lastTimelineEntry?.assigned_to_email) ||
    normOfficerValue(lastTimelineEntry?.assigned_email) ||
    normOfficerValue(lastTimelineEntry?.officer_email) ||
    normOfficerValue(memoData.assigned_officer?.email) ||
    normOfficerValue(memoData.current_officer?.email) ||
    null;

  // Transform API data to component format
  const data =
    // memoData
    //   ?
    {
      trackingId: memoData.tracking_id,
      title: memoData.subject,
      reference: memoData.reference_number,
      priority: memoData.priority,
      status: memoData.status,
      sender: memoData.sender_organization,
      senderContact: memoData.sender_contact,
      category: memoData.category_relation?.name || memoData.category,
      dateReceived: new Date(memoData.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      currentDepartment: normalizeDepartment(
        lastTimelineEntry?.assigned_to_department ||
          lastTimelineEntry?.forwarded_to_department ||
          (lastTimelineEntry?.department !== "Unknown"
            ? lastTimelineEntry?.department
            : null),
      ),
      daysInSystem: Math.ceil(memoData.quick_info?.days_in_system || 0),
      totalMovements: memoData.movement_timeline?.length || 0,
      description: memoData.description,
      assignmentRemarks: memoData.assignment_remarks,
      timeline:
        memoData.movement_timeline?.map((item, index, arr) =>
          buildTimelineEntry(item, index, arr),
        ) || [],
      attachments: memoData.attachments || [],
      activityLogs: memoData.activity_logs || [],
      assignments: memoData.assignments || [],
      forwards: memoData.forwards || [],
    };

  const timeInSystemDisplay = (() => {
    const created = memoData.created_at || memoData.date_received;
    if (created) {
      const diffMs = new Date() - new Date(created);
      if (!isNaN(diffMs) && diffMs >= 0) {
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"}`;
        const days = Math.floor(hours / 24);
        return `${days} ${days === 1 ? "day" : "days"}`;
      }
    }
    const qiHours = memoData.quick_info?.hours_in_system;
    if (qiHours !== undefined && qiHours !== null) {
      const h = Math.floor(Number(qiHours));
      if (!isNaN(h)) {
        if (h < 24) return `${h} ${h === 1 ? "hour" : "hours"}`;
        const d = Math.floor(h / 24);
        return `${d} ${d === 1 ? "day" : "days"}`;
      }
    }
    const qiDays = memoData.quick_info?.days_in_system;
    if (qiDays !== undefined && qiDays !== null) {
      const numDays = Number(qiDays);
      if (!isNaN(numDays)) {
        if (numDays < 1) {
          const h = Math.round(numDays * 24);
          return `${h} ${h === 1 ? "hour" : "hours"}`;
        }
        const d = Math.floor(numDays);
        return `${d} ${d === 1 ? "day" : "days"}`;
      }
    }
    return "—";
  })();
  // : {
  //     trackingId: "EXT-2024-001",
  //     title: "Curriculum Review Guidelines",
  //     reference: "MOE/ADM/2024/0125",
  //     priority: "high",
  //     status: "processing",
  //     sender: "Ministry of Education",
  //     category: "Policy",
  //     dateReceived: "Dec 9, 2024, 09:30 AM",
  //     currentDepartment: "Academic Affairs",
  //     daysInSystem: 369,
  //     totalMovements: 4,
  //     description:
  //       "New guidelines for curriculum review process for all academic departments. Requires implementation by Q1 2025.",
  //     timeline: [
  //       {
  //         id: 1,
  //         title: "Received",
  //         date: "Dec 9, 2024, 09:30 AM",
  //         description:
  //           "Memo received from Ministry of Education via postal mail",
  //         status: "completed",
  //       },
  //       {
  //         id: 2,
  //         title: "Assigned",
  //         subtitle: "Registry Office → Academic Affairs Department",
  //         date: "Dec 9, 2024, 10:15 AM",
  //         description:
  //           "Assigned to Academic Affairs for review and implementation",
  //         status: "completed",
  //       },
  //       {
  //         id: 3,
  //         title: "Acknowledged",
  //         date: "Dec 9, 2024, 11:45 AM",
  //         description: "Received and reviewing the guidelines",
  //         status: "completed",
  //       },
  //       {
  //         id: 4,
  //         title: "Forwarded",
  //         subtitle: "Academic Affairs → Computer Science Department",
  //         date: "Dec 9, 2024, 03:30 PM",
  //         description: "Forwarded to CS department for curriculum updates",
  //         status: "current",
  //       },
  //     ],
  //   };

  const handleCopy = () => {
    navigator.clipboard.writeText(data.trackingId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Top Navigation & Tracking ID */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            onClick={onBack}
            className="group flex items-center text-xs text-gray-500 hover:text-gray-900 transition-colors"
          >
            <FiArrowLeft className="mr-2 h-3 w-3 group-hover:-translate-x-1 transition-transform" />
            Back to Search
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500">Tracking ID:</span>
            <span className="font-mono font-medium text-gray-900">
              {data.trackingId}
            </span>
            <button
              onClick={handleCopy}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
              title="Copy Tracking ID"
            >
              {copied ? (
                <FiCheck className="h-3 w-3 text-green-600" />
              ) : (
                <FiCopy className="h-3 w-3" />
              )}
            </button>
          </div>
        </div>

        {/* Status Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 sm:p-6 text-white shadow-lg overflow-hidden relative">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <FiClock className="w-24 h-24" />
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 text-blue-100 text-xs font-medium mb-1">
                <FiClock className="w-3 h-3" />
                Current Status
              </div>
              <h2 className="text-2xl font-bold capitalize">{data.status}</h2>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-blue-100 text-xs font-medium mb-1">
                Time in System
              </div>
              <div className="text-xl font-bold">{timeInSystemDisplay}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Memo Details Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {data.title}
                  </h3>
                  <p className="text-xs text-gray-500 font-mono">
                    {data.reference}
                  </p>
                </div>
                {data.priority === "high" && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-50 text-orange-700 border border-orange-100 capitalize">
                    {data.priority} priority
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 mb-6">
                <div>
                  <dt className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">
                    Sender Organization
                  </dt>
                  <dd className="flex items-center gap-1.5 text-xs font-medium text-gray-900">
                    <span className="p-0.5 rounded-full bg-gray-100 text-gray-600">
                      <FiUser className="w-2.5 h-2.5" />
                    </span>
                    {data.sender}
                  </dd>
                </div>
                {data.senderContact && (
                  <div>
                    <dt className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">
                      Sender Contact
                    </dt>
                    <dd className="text-xs font-medium text-gray-900">
                      {data.senderContact}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">
                    Category
                  </dt>
                  <dd className="text-xs font-medium text-gray-900">
                    {data.category}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">
                    Date Received
                  </dt>
                  <dd className="text-xs font-medium text-gray-900">
                    {data.dateReceived}
                  </dd>
                </div>
                {/* <div>
                  <dt className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">
                    Current Department
                  </dt>
                  <dd className="text-xs font-medium text-gray-900">
                    {isOfficeDepartment ? (
                      currentOfficerName || currentOfficerEmail ? (
                        <span>
                          {currentOfficerName || "—"}
                          {currentOfficerEmail && (
                            <>
                              <br />
                              <a
                                href={`mailto:${currentOfficerEmail}`}
                                className="text-blue-600 hover:underline font-normal break-all"
                              >
                                {currentOfficerEmail}
                              </a>
                            </>
                          )}
                        </span>
                      ) : (
                        "No department"
                      )
                    ) : (
                      data.currentDepartment
                    )}
                  </dd>
                </div> */}
                <div>
                  <dt className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">
                    Total Movements
                  </dt>
                  <dd className="text-xs font-medium text-gray-900">
                    {data.totalMovements}
                  </dd>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <dt className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
                  Description
                </dt>
                <dd className="text-xs text-gray-700 leading-relaxed">
                  {data.description}
                </dd>
              </div>

              {data.assignmentRemarks && (
                <div className="pt-4 border-t border-gray-100">
                  <dt className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
                    Assignment Remarks
                  </dt>
                  <dd className="text-xs text-gray-700 leading-relaxed">
                    {data.assignmentRemarks}
                  </dd>
                </div>
              )}
            </div>

            {/* Timeline Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-6">
                <FiClock className="w-4 h-4 text-gray-400" />
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Processing Timeline
                  </h3>
                  <p className="text-xs text-gray-500">
                    Track the movement and processing history of your memo
                  </p>
                </div>
              </div>

              <div className="relative pl-3">
                {/* Vertical line */}
                <div
                  className="absolute top-2 left-6 bottom-6 w-0.5 bg-gray-200"
                  aria-hidden="true"
                ></div>

                <div className="space-y-6">
                  {data.timeline.map((step, index) => (
                    <div key={step.id} className="relative flex gap-4">
                      {/* Icon/Number */}
                      <div className="flex-shrink-0">
                        <div className="relative z-10 flex items-center justify-center w-5 h-5 rounded-full bg-gray-900 text-white text-[10px] font-bold border-2 border-white shadow-sm">
                          {index + 1}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 mb-1">
                          <div className="flex flex-wrap items-baseline gap-2">
                            <h4 className="text-xs font-bold text-gray-900">
                              {step.title}
                            </h4>
                            {step.subtitle && (
                              <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
                                {step.subtitle}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-500 whitespace-nowrap">
                            {step.date}
                          </span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2.5 text-xs text-gray-600 border border-gray-100">
                          {step.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-4">
            {/* Quick Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="text-base font-bold text-gray-900 mb-4">
                Quick Info
              </h3>
              <dl className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                  <dt className="text-xs text-gray-500">Status</dt>
                  <dd>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-100 text-yellow-800 capitalize">
                      {data.status}
                    </span>
                  </dd>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                  <dt className="text-xs text-gray-500">Priority</dt>
                  <dd>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-50 text-orange-700 border border-orange-100 capitalize">
                      {data.priority}
                    </span>
                  </dd>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                  <dt className="text-xs text-gray-500">Total Movements</dt>
                  <dd className="text-xs font-bold text-gray-900">
                    {data.totalMovements}
                  </dd>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                  <dt className="text-xs text-gray-500">Time in System</dt>
                  <dd className="text-xs font-bold text-gray-900">
                    {timeInSystemDisplay}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Status Guide Card */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <h3 className="text-base font-bold text-gray-900 mb-3">
                Status Guide
              </h3>
              <div className="space-y-3">
                <div className="flex gap-2.5">
                  <span className="flex-shrink-0 inline-flex items-center h-5 px-2 rounded-full text-[10px] font-medium bg-blue-100 text-blue-800">
                    received
                  </span>
                  <p className="text-[10px] text-gray-600 leading-snug">
                    Memo has been received and registered
                  </p>
                </div>
                <div className="flex gap-2.5">
                  <span className="flex-shrink-0 inline-flex items-center h-5 px-2 rounded-full text-[10px] font-medium bg-yellow-100 text-yellow-800">
                    processing
                  </span>
                  <p className="text-[10px] text-gray-600 leading-snug">
                    Currently being reviewed or actioned
                  </p>
                </div>
                <div className="flex gap-2.5">
                  <span className="flex-shrink-0 inline-flex items-center h-5 px-2 rounded-full text-[10px] font-medium bg-purple-100 text-purple-800">
                    forwarded
                  </span>
                  <p className="text-[10px] text-gray-600 leading-snug">
                    Forwarded to another department
                  </p>
                </div>
                <div className="flex gap-2.5">
                  <span className="flex-shrink-0 inline-flex items-center h-5 px-2 rounded-full text-[10px] font-medium bg-green-100 text-green-800">
                    completed
                  </span>
                  <p className="text-[10px] text-gray-600 leading-snug">
                    Processing completed successfully
                  </p>
                </div>
              </div>
            </div>

            {/* Need Help Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="text-base font-bold text-gray-900 mb-3">
                Need Help?
              </h3>
              <p className="text-xs text-gray-500 mb-3">
                If you have questions about your memo or need assistance, please
                contact:
              </p>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="font-medium text-gray-900 text-xs">
                  Registry Office
                </div>
                <a
                  href="mailto:support@unizik.edu.ng"
                  className="text-xs text-blue-600 hover:underline"
                >
                  support@unizik.edu.ng
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrackMemoDetails;
