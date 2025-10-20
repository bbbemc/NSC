var composer, viewer, btnGen, btnTerminate;
var calculator, timeStart, timeEnd;

function report(stateText) {
    document.getElementById('state').innerHTML = stateText;
}

function getCurrMol() {
    //return composer.getChemSpace().getChildAt(0);
    return Kekule.ChemStructureUtils.getTotalStructFragment(composer.getChemObj());
}

function calcStart() {
    btnGen.setEnabled(false);
    btnTerminate.setEnabled(true);
    timeStart = Date.now();
}
function calcEnd() {
    btnGen.setEnabled(true);
    btnTerminate.setEnabled(false);
    timeEnd = Date.now();
}

function generate3D() {
    var mol = getCurrMol();
    report('[ กำลังประมวลผล รอสักครู่... ^ ^ ]');
    calcStart();
    calculator = Kekule.Calculator.generate3D(mol, { 'forceField': '' },
        function (generatedMol) {
            calcEnd();
            var elapse = (timeEnd - timeStart) / 1000;
            viewer.setChemObj(generatedMol);
            report('[ ใช้เวลาประมวลผล ' + elapse + ' วินาที ]');
        },
        function (err) {
            if (err) {
                calcEnd();
                // ดักข้อความ TypeError: …getFlattenedShadowFragment…
                var msg = err.getMessage ? err.getMessage() : String(err);
                if (
                    err instanceof TypeError &&
                    msg.includes('getFlattenedShadowFragment')
                ) {
                    report('[ อย่าลืมวาดรูป 2มิติ ก่อนนะ ^ ^; ]');
                } else {
                    report(msg);
                }
                // ยัง log ผ่าน Kekule.error ตามปกติ (ถ้าต้องการ)
                Kekule.error(err);
            }
        }
    );
}
function terminate() {
    report('Terminated by user');
    calcEnd();
    if (calculator) {
        calculator.halt();
    }
}

function init() {
    viewer = Kekule.Widget.getWidgetById('chemViewer');
    composer = Kekule.Widget.getWidgetById('composer');

    // ตั้งค่าพื้นหลังของ composer (2D editor)
    composer.getEditor().setBackgroundColor('#ccccccff');

    // เพิ่มปุ่มทั่วไปของคุณเอง (Generate 3D, Terminate)
    var toolButtons = composer.getCommonToolButtons() || composer.getDefaultCommonToolBarButtons();
    toolButtons.push({
        'id': 'btnGen',
        'text': 'สร้าง 3มิติ',
        'hint': 'Generate 3D structure',
        'showText': true,
        'showGlyph': false,
        'cssText': 'width:auto',
        '#execute': generate3D
    });

    toolButtons.push({
        'id': 'btnTerminate',
        'text': 'หยุดการสร้าง',
        'hint': 'Terminate calculation',
        'showText': true,
        'showGlyph': false,
        'cssText': 'width:auto',
        '#execute': terminate
    });
    composer.setCommonToolButtons(toolButtons);
    btnGen = Kekule.Widget.getWidgetById('btnGen');
    btnTerminate = Kekule.Widget.getWidgetById('btnTerminate');
    btnTerminate.setEnabled(false);
}

Kekule.X.domReady(init);
