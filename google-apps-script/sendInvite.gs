// ============================================
// ADD THIS FUNCTION TO YOUR EXISTING GOOGLE APPS SCRIPT
// (Add it anywhere in your Code.gs file, outside other functions)
// ============================================

function sendInvite(data) {
  try {
    var name = data.name || "";
    var email = data.email || "";
    var position = data.position || "";
    var stage = data.stage || "";
    var mode = data.mode || "Virtual"; // "Virtual" or "Face to Face"
    var dateStr = data.date || ""; // "2026-02-15"
    var timeStr = data.time || "09:00"; // "09:00"
    
    if (!name || !dateStr || !timeStr) {
      return { success: false, error: "Missing required fields (name, date, time)" };
    }
    
    // Parse date and time
    var parts = dateStr.split("-");
    var timeParts = timeStr.split(":");
    var startDate = new Date(
      parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]),
      parseInt(timeParts[0]), parseInt(timeParts[1])
    );
    var endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration
    
    // Format date for email (e.g., "15th February 2026")
    var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    var day = startDate.getDate();
    var suffix = (day === 1 || day === 21 || day === 31) ? "st" : (day === 2 || day === 22) ? "nd" : (day === 3 || day === 23) ? "rd" : "th";
    var formattedDate = day + suffix + " " + months[startDate.getMonth()] + " " + startDate.getFullYear();
    
    // Format time for email (e.g., "09:00 AM")
    var hours = startDate.getHours();
    var minutes = startDate.getMinutes();
    var ampm = hours >= 12 ? "PM" : "AM";
    var displayHours = hours % 12;
    if (displayHours === 0) displayHours = 12;
    var formattedTime = displayHours + ":" + (minutes < 10 ? "0" : "") + minutes + " " + ampm;
    
    // Email subject
    var modeLabel = mode === "Virtual" ? "Virtual" : "F2F";
    var subject = name + " " + modeLabel + " Interview - " + position;
    
    // Email body based on mode
    var body = "";
    if (mode === "Virtual") {
      body = "Dear " + name + ",\n\n" +
        "Greetings from ArneHire HR (Hiring partner of Digital Disruptors).\n\n" +
        "As per our discussion we are scheduling your interview on " + formattedDate + " at " + formattedTime + ". " +
        "It will be a Google meet video call and you have to attend this using a laptop/PC. You will get the meeting link before 15 mins.\n\n" +
        "Best Regards,\n" +
        "Suhasini Kanade\n" +
        "ArneHire HR";
    } else {
      body = "Dear " + name + ",\n\n" +
        "We are pleased to inform you that after reviewing your application, we would like to invite you to interview for the " + position + " position at Digital Disruptors. " +
        "We believe your qualifications and experience align well with the requirements for this role.\n\n" +
        "Please find the interview details below:\n\n" +
        "Date: " + formattedDate + ", " + formattedTime + "\n\n" +
        "Location: 204, Shiv Chamber, A-203, Sector 11, CBD Belapur, Navi Mumbai, Maharashtra 400614\n\n" +
        "Interviewer(s): Mr. Kumar Anand\n\n" +
        "Kindly acknowledge this email.\n\n" +
        "Regards,\n" +
        "Suhasini Kanade\n" +
        "Arnehire HR";
    }
    
    // Read default emails from "Emails" sheet
    var defaultEmails = [];
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var emailSheet = ss.getSheetByName("Emails");
      if (emailSheet) {
        var emailData = emailSheet.getRange(1, 1, emailSheet.getLastRow(), 1).getValues();
        for (var i = 0; i < emailData.length; i++) {
          var e = (emailData[i][0] || "").toString().trim();
          if (e && e.indexOf("@") > -1) defaultEmails.push(e);
        }
      }
    } catch(emailErr) {
      Logger.log("Could not read Emails sheet: " + emailErr.toString());
    }
    
    // Combine candidate email + default emails
    var allGuests = defaultEmails.slice();
    if (email) allGuests.unshift(email);
    var guestList = allGuests.join(",");
    
    // Create Google Calendar event
    var calendar = CalendarApp.getDefaultCalendar();
    var eventTitle = name + " - " + stage + " (" + modeLabel + ")";
    var event;
    
    if (mode === "Virtual") {
      event = calendar.createEvent(eventTitle, startDate, endDate, {
        description: body,
        guests: guestList || undefined,
        sendInvites: guestList.length > 0
      });
    } else {
      // F2F event with location
      event = calendar.createEvent(eventTitle, startDate, endDate, {
        description: body,
        location: "204, Shiv Chamber, A-203, Sector 11, CBD Belapur, Navi Mumbai, Maharashtra 400614",
        guests: guestList || undefined,
        sendInvites: guestList.length > 0
      });
    }
    
    return { success: true, message: "Invite sent successfully" + (email ? " to " + email : " (no email, calendar event only)") };
    
  } catch(err) {
    Logger.log("sendInvite error: " + err.toString());
    return { success: false, error: err.toString() };
  }
}


// ============================================
// MODIFY YOUR EXISTING doPost FUNCTION
// Add this case inside the switch/if block that handles actions:
// ============================================

// Inside your existing doPost(e) function, find where you handle actions
// and ADD this case:
//
//   if (action === "sendInvite") {
//     var result = sendInvite(body);
//     return ContentService.createTextOutput(JSON.stringify(result))
//       .setMimeType(ContentService.MimeType.JSON);
//   }
