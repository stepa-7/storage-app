//package com.stepa7.authservice.notification;
//
//import com.stepa7.authservice.user.User;
//import com.stepa7.authservice.user.UserRepository;
//import jakarta.mail.internet.MimeMessage;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.mail.SimpleMailMessage;
//import org.springframework.mail.javamail.JavaMailSender;
//import org.springframework.mail.javamail.MimeMessageHelper;
//import org.springframework.stereotype.Service;
//
//import java.util.List;
//
//@Service
//public class EmailService {
//
//    @Autowired
//    private JavaMailSender mailSender;
//
//    @Autowired
//    private UserRepository userRepository;
//
//    public void sendBulkEmail(String subject, String text) {
//        List<User> users = userRepository.findAll();
//
//        for (User user : users) {
//            try {
//                sendEmail(user.getMail(), subject, text);
//                Thread.sleep(100);
//            } catch (Exception e) {
//                throw new RuntimeException("Failed to send email to: " + user.getMail());
//            }
//        }
//    }
//
//    private void sendEmail(String to, String subject, String text) {
//        SimpleMailMessage message = new SimpleMailMessage();
//        message.setFrom("noreply@company.com");
//        message.setTo(to);
//        message.setSubject(subject);
//        message.setText(text);
//
//        mailSender.send(message);
//    }
//}