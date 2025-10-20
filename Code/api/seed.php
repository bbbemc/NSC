<?php
// =========================================================================
// PHP: Seed Script
// - This file generates a large number of sample questions to populate the database.
// =========================================================================

// The path to 'db.php' assumes this file is in the parent directory.
require_once __DIR__ . '/../db.php';
header('Content-Type: text/plain; charset=utf-8');

// Create a large number of sample questions for immediate use
$topics = ['bonding','periodic','stoich','acidbase','organic'];
$diffs = ['easy','normal','hard','insane'];

$qtexts = [
 'โมเลกุลใดมีทรงเรขาคณิตแบบเชิงเส้น (linear)?',
 'เลขออกซิเดชันของ S ใน H2SO4 คือเท่าใด?',
 'กรดใดต่อไปนี้เป็นกรดแรง?',
 'หมู่ฟังก์ชันใดเป็นกลุ่มคาร์บอนิล?',
 'สมบัติของพันธะไอออนิกคือข้อใด',
 'สารละลายใดมีค่า pH ต่ำที่สุด?',
 'สูตรเอมพิริคัลของ C6H12O6 คือ?',
 'ธาตุใดมีค่า EN สูงที่สุดในตารางธาตุ',
 'โมเลกุลใดมีไดโพลโมเมนต์เป็นศูนย์',
 'ตัวเร่งปฏิกิริยา (catalyst) ทำหน้าที่อย่างไร',
];

try {
    $pdo->exec("DELETE FROM questions");
    $pdo->exec("ALTER TABLE questions AUTO_INCREMENT = 1");

    $insert = $pdo->prepare("INSERT INTO questions (topic,difficulty,question,option_a,option_b,option_c,option_d,answer) VALUES (?,?,?,?,?,?,?,?)");

    $count = 0;
    for($t=0;$t<5;$t++){
      foreach($diffs as $d){
        foreach($qtexts as $i=>$qt){
          $a='A'; $b='B'; $c='C'; $dkey='D';
          $opts = [
            'A' => 'คำตอบตัวเลือก A',
            'B' => 'คำตอบตัวเลือก B',
            'C' => 'คำตอบตัวเลือก C',
            'D' => 'คำตอบตัวเลือก D',
          ];
          $ans = array_rand($opts);
          $insert->execute([$topics[$t], $d, $qt . ' #' . ($i+1) . ' (' . $topics[$t] . ')', $opts['A'],$opts['B'],$opts['C'],$opts['D'],$ans]);
          $count++;
        }
      }
    }
    // Add many specific questions on VSEPR
    for($i=0;$i<120;$i++){
      $shape = ['linear','bent','trigonal planar','tetrahedral','trigonal bipyramidal','octahedral'][array_rand([0,1,2,3,4,5])];
      $q = "โครงสร้าง VSEPR ของโมเลกุลจำลอง X" . rand(1,4) . "Y" . rand(1,4) . " คือแบบใด?";
      $insert->execute(['bonding','normal',$q,'linear','bent','trigonal planar','tetrahedral','ABCD'[rand(0,3)]]);
      $count++;
    }

    echo "seeded: $count questions";
} catch (Exception $e) {
    http_response_code(500); // Internal Server Error
    echo "Error: " . $e->getMessage();
}
?>
