import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, subject, message, rating, feedbackType } = body

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required fields" }, { status: 400 })
    }

    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER || "quakeinsight@gmail.com",
        pass: process.env.EMAIL_PASSWORD || "kctr wyhi uuvk hvhg",
      },
    })

    // Format the rating as stars
    const ratingStars = rating > 0 ? "★".repeat(rating) + "☆".repeat(5 - rating) : "No rating provided"

    // Prepare email content
    const mailOptions = {
      from: process.env.EMAIL_USER || "quakeinsight@gmail.com",
      to: "quakeinsight@gmail.com",
      replyTo: email, 
      subject: `QuakeInsight Contact: ${subject || "New Message"}`,
      html: `
        <h2>New Message from QuakeInsight Contact Form</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject || "N/A"}</p>
        <p><strong>Feedback Type:</strong> ${feedbackType || "General"}</p>
        <p><strong>Rating:</strong> ${ratingStars}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    }

    // Send email
    if (process.env.EMAIL_PASSWORD) {
      await transporter.sendMail(mailOptions)
    } else {
      // If no email password is set, log the email content (for development)
      console.log("Email would be sent with the following content:", mailOptions)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in contact API route:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}

