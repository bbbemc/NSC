<?php
class User
{

    private $conn;

    public function __construct($dbConnection)
    {
        $this->conn = $dbConnection;
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    // 🔹 สมัครสมาชิก
    public function register($name, $email, $password)
    {
        // ตรวจสอบ email ซ้ำ
        $stmt = $this->conn->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $stmt->store_result(); // ป้องกันปัญหา get_result ใช้ไม่ได้ในบาง server
        if ($stmt->num_rows > 0) {
            return ["status" => false, "message" => "อีเมลนี้ถูกใช้แล้ว"];
        }
        $stmt->close();

        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $this->conn->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $name, $email, $hashedPassword);
        if ($stmt->execute()) {
            return ["status" => true, "message" => "สมัครสมาชิกสำเร็จ"];
        } else {
            return ["status" => false, "message" => "สมัครสมาชิกไม่สำเร็จ"];
        }
    }

    // 🔹 เข้าสู่ระบบ
    public function login($email, $password)
    {
        $stmt = $this->conn->prepare("SELECT id, password, name FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();


        if ($user && password_verify($password, $user['password'])) {
            session_regenerate_id(true);
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['email'] = $email;
            $_SESSION['name'] = $user['name'];
            return ["status" => true, "message" => "เข้าสู่ระบบสำเร็จ"];
        }
        return ["status" => false, "message" => "อีเมลหรือรหัสผ่านไม่ถูกต้อง"];
    }

    // 🔹 ออกจากระบบ
    public function logout()
    {
        $_SESSION = [];
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(
                session_name(),
                '',
                time() - 42000,
                $params["path"],
                $params["domain"],
                $params["secure"],
                $params["httponly"]
            );
        }
        session_destroy();
    }

    // 🔹 ดึงข้อมูลผู้ใช้ปัจจุบัน
    public function getCurrentUser()
    {
        if (!isset($_SESSION['user_id'])) {
            return null;
        }
        $user_id = intval($_SESSION['user_id']);
        $stmt = $this->conn->prepare("SELECT id, name, email, created_at FROM users WHERE id = ?");
        $stmt->execute([$user_id]);
        return $stmt->fetch();
    }

    // 🔹 อัปเดตข้อมูลผู้ใช้
    public function updateProfile($name)
    {
        if (!isset($_SESSION['user_id'])) {
            return ["status" => false, "message" => "ยังไม่ได้เข้าสู่ระบบ"];
        }
        $user_id = intval($_SESSION['user_id']);
        $stmt = $this->conn->prepare("UPDATE users SET name = ? WHERE id = ?");
        $stmt->bind_param("si", $name, $user_id);
        if ($stmt->execute()) {
            $_SESSION['name'] = $name;
            return ["status" => true, "message" => "แก้ไขข้อมูลสำเร็จ"];
        } else {
            return ["status" => false, "message" => "แก้ไขข้อมูลไม่สำเร็จ"];
        }
    }

    // 🔹 เปลี่ยนรหัสผ่าน
    public function changePassword($currentPassword, $newPassword)
    {
        if (!isset($_SESSION['user_id'])) {
            return ["status" => false, "message" => "ยังไม่ได้เข้าสู่ระบบ"];
        }
        $user_id = intval($_SESSION['user_id']);

        $stmt = $this->conn->prepare("SELECT password FROM users WHERE id = ?");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();

        if (!$user || !password_verify($currentPassword, $user['password'])) {
            return ["status" => false, "message" => "รหัสผ่านเดิมไม่ถูกต้อง"];
        }

        $newHashed = password_hash($newPassword, PASSWORD_DEFAULT);
        $stmt = $this->conn->prepare("UPDATE users SET password = ? WHERE id = ?");
        $stmt->bind_param("si", $newHashed, $user_id);
        if ($stmt->execute()) {
            return ["status" => true, "message" => "เปลี่ยนรหัสผ่านสำเร็จ"];
        } else {
            return ["status" => false, "message" => "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน"];
        }
    }
}
