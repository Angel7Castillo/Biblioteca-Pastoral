<?php

namespace Database\Seeders;

use App\Models\StrongDictionary;
use App\Models\TheologicalTerm;
use Illuminate\Database\Seeder;

class StrongDictionarySeeder extends Seeder
{
    public function run(): void
    {
        // 1. Concordancia Strong (Griego & Hebreo)
        $strongEntries = [
            [
                'code' => 'G4151',
                'original_word' => 'πνεῦμα',
                'transliteration' => 'pneuma',
                'pronunciation' => "pnoy'-mah",
                'definition' => 'Viento, aliento, espíritu. Se refiere al Espíritu Santo (la tercera Persona de la Trinidad), al espíritu humano, o a seres espirituales. Denota vida, poder dinámico e influencia divina.',
                'type' => 'greek',
            ],
            [
                'code' => 'G3056',
                'original_word' => 'λόγος',
                'transliteration' => 'logos',
                'pronunciation' => "log'-os",
                'definition' => 'Palabra, discurso, pensamiento revelado o razón divina. En el Evangelio de Juan (Juan 1:1,14) designa a la Segunda Persona de la Trinidad, Jesucristo, como la Revelación encarnada de Dios.',
                'type' => 'greek',
            ],
            [
                'code' => 'G26',
                'original_word' => 'ἀγάπη',
                'transliteration' => 'agape',
                'pronunciation' => "ag-ah'-pay",
                'definition' => 'Amor divino, incondicional, sacrificial y voluntario. Es el amor supremo de Dios demostrado al entregar a su Hijo (Juan 3:16) y la naturaleza que caracteriza la vida del creyente (1 Cor 13).',
                'type' => 'greek',
            ],
            [
                'code' => 'G5485',
                'original_word' => 'χάρις',
                'transliteration' => 'charis',
                'pronunciation' => "khar'-ece",
                'definition' => 'Gracia, favor inmerecido, benevolencia divina. La operación gratuita de Dios otorgando salvación, perdón y fortaleza al creyente sin ningún mérito humano (Efesios 2:8-9).',
                'type' => 'greek',
            ],
            [
                'code' => 'G4102',
                'original_word' => 'πίστις',
                'transliteration' => 'pistis',
                'pronunciation' => "pis'-tis",
                'definition' => 'Fe, convicción firme, fidelidad y confianza personal en Dios y sus promesas. No es simple asentimiento mental, sino compromiso vivo y obediencia (Hebreos 11:1).',
                'type' => 'greek',
            ],
            [
                'code' => 'G1343',
                'original_word' => 'δικαιοσύνη',
                'transliteration' => 'dikaiosyne',
                'pronunciation' => "dik-ah-yos-oo'-nay",
                'definition' => 'Justicia, rectitud. La condición requerida por Dios en la que el ser humano es declarado justo mediante la imputación del mérito de Cristo por la fe (Romanos 3:21-26).',
                'type' => 'greek',
            ],
            [
                'code' => 'H1254',
                'original_word' => 'בָּרָא',
                'transliteration' => 'bara',
                'pronunciation' => "baw-raw'",
                'definition' => 'Crear, formar de la nada (ex nihilo). Verbo hebreo cuyo sujeto gramatical en el Antiguo Testamento es exclusivamente Dios. Indica un acto cósmico de poder soberano (Génesis 1:1).',
                'type' => 'hebrew',
            ],
            [
                'code' => 'H430',
                'original_word' => 'אֱלֹהִים',
                'transliteration' => 'Elohim',
                'pronunciation' => "el-o-heem'",
                'definition' => 'Dios, Creador Soberano, Juez Supremo. Forma plural de majestad y plenitud de atributos divinos. Utilizado más de 2,500 veces en el Antiguo Testamento.',
                'type' => 'hebrew',
            ],
            [
                'code' => 'H3068',
                'original_word' => 'יְהוָה',
                'transliteration' => 'Yahweh / YHWH',
                'pronunciation' => "yeh-ho-vaw'",
                'definition' => 'EL SEÑOR. El nombre propio de Dios en el pacto con Israel. Revelado a Moisés en Éxodo 3:14 ("Yo Soy el que Soy"). Expresa existencia inmutable, autoexistencia y fidelidad a las promesas.',
                'type' => 'hebrew',
            ],
            [
                'code' => 'H7965',
                'original_word' => 'שָׁלוֹם',
                'transliteration' => 'shalom',
                'pronunciation' => "shaw-lome'",
                'definition' => 'Paz, plenitud, integridad, salud y prosperidad espiritual. Es la restauración completa del orden divino y la armonía entre el ser humano y Dios.',
                'type' => 'hebrew',
            ],
            [
                'code' => 'H2617',
                'original_word' => 'חֶסֶד',
                'transliteration' => 'chesed',
                'pronunciation' => "kheh'-sed",
                'definition' => 'Amor leal, bondad inagotable, misericordia de pacto. Describe el compromiso inquebrantable de Dios de amar y rescatar a su pueblo a pesar de sus fallas.',
                'type' => 'hebrew',
            ],
            [
                'code' => 'H6944',
                'original_word' => 'קֹדֶשׁ',
                'transliteration' => 'qodesh',
                'pronunciation' => "ko'-desh",
                'definition' => 'Santidad, separación, consagración. Perteneciente a la categoría divina de pureza absoluta y distinción radical del pecado y de lo común.',
                'type' => 'hebrew',
            ],
        ];

        foreach ($strongEntries as $entry) {
            StrongDictionary::updateOrCreate(
                ['code' => $entry['code']],
                $entry
            );
        }

        // 2. Términos del Diccionario Teológico
        $theologicalTerms = [
            [
                'term' => 'Justificación',
                'category' => 'Soteriología',
                'definition' => 'Declaración judicial por la cual Dios declara justo al pecador sobre la base de la justicia perfecta imputada de Jesucristo, recibida únicamente mediante la fe y no por obras.',
                'cross_references' => 'Romanos 3:24-26, Romanos 5:1, Gálatas 2:16',
            ],
            [
                'term' => 'Santificación',
                'category' => 'Soteriología',
                'definition' => 'Proceso continuo y progresivo impulsado por el Espíritu Santo mediante el cual el creyente es transformado a la imagen de Cristo, muriendo al pecado y viviendo para la rectitud.',
                'cross_references' => '1 Tesalonicenses 4:3, Filipenses 1:6, Romanos 6:19',
            ],
            [
                'term' => 'Redención',
                'category' => 'Soteriología',
                'definition' => 'Rescate y liberación de la esclavitud del pecado mediante el pago del rescate, a saber, la sangre preciosa de Jesucristo derramada en la cruz.',
                'cross_references' => 'Efesios 1:7, 1 Pedro 1:18-19, Colosenses 1:14',
            ],
            [
                'term' => 'Propiciación',
                'category' => 'Cristología / Expiación',
                'definition' => 'El acto sustitutivo de Cristo en la cruz mediante el cual se apacigua la justa ira de Dios contra el pecado y se satisface plenamente la santidad divina.',
                'cross_references' => '1 Juan 2:2, Romanos 3:25, Hebreos 2:17',
            ],
            [
                'term' => 'Escatología',
                'category' => 'Teología Sistemática',
                'definition' => 'Estudio bíblico y sistemático de los acontecimientos finales: la Segunda Venida de Cristo, la resurrección de los muertos, el juicio final y la renovación del cosmos.',
                'cross_references' => 'Apocalipsis 21-22, 1 Tesalonicenses 4:13-18, Mateo 24',
            ],
            [
                'term' => 'Soteriología',
                'category' => 'Teología Sistemática',
                'definition' => 'Rama de la teología sistemática que investiga la doctrina de la salvación: elección, regeneración, fe, conversión, justificación, adopción, santificación y glorificación.',
                'cross_references' => 'Efesios 2:8-10, Romanos 8:29-30',
            ],
            [
                'term' => 'Pneumatología',
                'category' => 'Teología Sistemática',
                'definition' => 'Doctrina sobre la Persona divina, atributos, deidad y ministerio del Espíritu Santo en la creación, iluminación de la Escritura, convicción de pecado y morada en el creyente.',
                'cross_references' => 'Juan 14:16-17, Juan 16:7-14, Hechos 1:8',
            ],
            [
                'term' => 'Cristología',
                'category' => 'Teología Sistemática',
                'definition' => 'Estudio de la Persona y obra de Jesucristo: su preexistencia divina, encarnación virginal, perfecta humanidad, vida sin pecado, muerte expiatoria y exaltación celestial.',
                'cross_references' => 'Colosenses 1:15-20, Filipenses 2:5-11, Juan 1:1-14',
            ],
            [
                'term' => 'Gracia Irresistible',
                'category' => 'Soteriología / Doctrinas de la Gracia',
                'definition' => 'Obra eficaz e invencible del Espíritu Santo que regenera el corazón del pecador elegido, otorgándole el don de la fe para responder voluntaria y gozosamente al llamado del Evangelio.',
                'cross_references' => 'Juan 6:37, Juan 6:44, Efesios 2:4-5',
            ],
            [
                'term' => 'Inerrancia Bíblica',
                'category' => 'Bibliología',
                'definition' => 'La doctrina de que las Sagradas Escrituras, en sus manuscritos originales, están totalmente exentas de error en todo lo que afirman, siendo la fiel e infalible Palabra de Dios.',
                'cross_references' => '2 Timoteo 3:16-17, 2 Pedro 1:20-21, Salmo 119:160',
            ],
        ];

        foreach ($theologicalTerms as $term) {
            TheologicalTerm::updateOrCreate(
                ['term' => $term['term']],
                $term
            );
        }
    }
}
