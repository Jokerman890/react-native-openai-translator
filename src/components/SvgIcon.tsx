import * as React from 'react'
import { ColorValue, StyleProp, ViewStyle } from 'react-native'
import Svg, { Path } from 'react-native-svg'

const SVG_NAMES = {
  settings:
    'M388 976l-20-126q-19-7-40-19t-37-25l-118 54-93-164 108-79q-2-9-2.5-20.5T185 576q0-9 .5-20.5T188 535L80 456l93-164 118 54q16-13 37-25t40-18l20-127h184l20 126q19 7 40.5 18.5T669 346l118-54 93 164-108 77q2 10 2.5 21.5t.5 21.5q0 10-.5 21t-2.5 21l108 78-93 164-118-54q-16 13-36.5 25.5T592 850l-20 126H388zm92-270q54 0 92-38t38-92q0-54-38-92t-92-38q-54 0-92 38t-38 92q0 54 38 92t92 38zm0-60q-29 0-49.5-20.5T410 576q0-29 20.5-49.5T480 506q29 0 49.5 20.5T550 576q0 29-20.5 49.5T480 646zm0-70zm-44 340h88l14-112q33-8 62.5-25t53.5-41l106 46 40-72-94-69q4-17 6.5-33.5T715 576q0-17-2-33.5t-7-33.5l94-69-40-72-106 46q-23-26-52-43.5T538 348l-14-112h-88l-14 112q-34 7-63.5 24T306 414l-106-46-40 72 94 69q-4 17-6.5 33.5T245 576q0 17 2.5 33.5T254 643l-94 69 40 72 106-46q24 24 53.5 41t62.5 25l14 112z',
  language:
    'M480 976q-84 0-157-31.5T196 859q-54-54-85-127.5T80 574q0-84 31-156.5T196 291q54-54 127-84.5T480 176q84 0 157 30.5T764 291q54 54 85 126.5T880 574q0 84-31 157.5T764 859q-54 54-127 85.5T480 976Zm0-58q35-36 58.5-82.5T577 725H384q14 60 37.5 108t58.5 85Zm-85-12q-25-38-43-82t-30-99H172q38 71 88 111.5T395 906Zm171-1q72-23 129.5-69T788 725H639q-13 54-30.5 98T566 905ZM152 665h159q-3-27-3.5-48.5T307 574q0-25 1-44.5t4-43.5H152q-7 24-9.5 43t-2.5 45q0 26 2.5 46.5T152 665Zm221 0h215q4-31 5-50.5t1-40.5q0-20-1-38.5t-5-49.5H373q-4 31-5 49.5t-1 38.5q0 21 1 40.5t5 50.5Zm275 0h160q7-24 9.5-44.5T820 574q0-26-2.5-45t-9.5-43H649q3 35 4 53.5t1 34.5q0 22-1.5 41.5T648 665Zm-10-239h150q-33-69-90.5-115T565 246q25 37 42.5 80T638 426Zm-254 0h194q-11-53-37-102.5T480 236q-32 27-54 71t-42 119Zm-212 0h151q11-54 28-96.5t43-82.5q-75 19-131 64t-91 115Z',
  translate:
    'M531 976q-23 0-33.5-15t-2.5-37l147-390q6-16 22-27t33-11q17 0 33.5 11t22.5 27l150 386q9 23-2 39.5T864 976q-11 0-21-7t-14-18l-33-101H604l-38 102q-4 10-14 17t-21 7Zm95-196h142l-70-194h-2l-70 194ZM289 438q15 26 33 50.5t39 50.5q45-47 75-97.5T487 336H80q-17 0-28.5-11.5T40 296q0-17 11.5-28.5T80 256h240v-40q0-17 11.5-28.5T360 176q17 0 28.5 11.5T400 216v40h240q17 0 28.5 11.5T680 296q0 17-11.5 28.5T640 336h-73q-22 69-58.5 135.5T419 598l98 99-30 81-127-122-173 173q-11 11-27 11t-27-12q-12-11-12-27t12-28l176-176q-26-31-49-62.5T218 470q-12-22-2-38t36-16q11 0 21.5 6.5T289 438Z',
  palette:
    'M480 976q-82 0-155-31.5t-127.5-86Q143 804 111.5 731T80 576q0-85 32-158t87.5-127q55.5-54 130-84.5T489 176q79 0 150 26.5T763.5 276q53.5 47 85 111.5T880 529q0 108-63 170.5T650 762h-75q-18 0-31 14t-13 31q0 27 14.5 46t14.5 44q0 38-21 58.5T480 976zm0-400zm-233 26q20 0 35-15t15-35q0-20-15-35t-35-15q-20 0-35 15t-15 35q0 20 15 35t35 15zm126-170q20 0 35-15t15-35q0-20-15-35t-35-15q-20 0-35 15t-15 35q0 20 15 35t35 15zm214 0q20 0 35-15t15-35q0-20-15-35t-35-15q-20 0-35 15t-15 35q0 20 15 35t35 15zm131 170q20 0 35-15t15-35q0-20-15-35t-35-15q-20 0-35 15t-15 35q0 20 15 35t35 15zM480 916q11 0 15.5-4.5T500 897q0-14-14.5-26T471 818q0-46 30-81t76-35h73q76 0 123-44.5T820 529q0-132-100-212.5T489 236q-146 0-247.5 98.5T140 576q0 141 99.5 240.5T480 916z',
  ['errow-drop-down']:
    'M459 675L332 548q-14-14-6.5-32.5T353 497h254q20 0 27.5 18.5T628 548L501 675q-5 5-10 7t-11 2q-6 0-11-2t-10-7z',
  ['swap-horiz']:
    'M666 621q-9-9-9-21t9-21l100-100H480q-13 0-21.5-8.5T450 449q0-13 8.5-21.5T480 419h286L665 318q-9-9-8.5-20.5T666 277q9-9 21-9t21 9l151 151q5 5 7 10t2 11q0 6-2 11t-7 10L707 622q-9 9-20.5 8.5T666 621ZM252 875 101 724q-5-5-7-10t-2-11q0-6 2-11t7-10l152-152q9-9 20.5-8.5T294 531q9 9 9 21t-9 21L194 673h286q13 0 21.5 8.5T510 703q0 13-8.5 21.5T480 733H194l101 101q9 9 8.5 20.5T294 875q-9 9-21 9t-21-9Z',
  summarize:
    'M309 435q12 0 21-9t9-21q0-12-9-21t-21-9q-12 0-21 9t-9 21q0 12 9 21t21 9Zm0 171q12 0 21-9t9-21q0-12-9-21t-21-9q-12 0-21 9t-9 21q0 12 9 21t21 9Zm0 171q12 0 21-9t9-21q0-12-9-21t-21-9q-12 0-21 9t-9 21q0 12 9 21t21 9ZM180 936q-24 0-42-18t-18-42V276q0-24 18-42t42-18h462l198 198v462q0 24-18 42t-42 18H180Zm0-60h600V447H639q-12.75 0-21.375-8.625T609 417V276H180v600Zm0-428.571V876 276v171.429V276v171.429Z',
  analytics:
    'M180 936q-24 0-42-18t-18-42V276q0-24 18-42t42-18h600q24 0 42 18t18 42v600q0 24-18 42t-42 18H180Zm0-60h600V276H180v600Zm134.175-97q12.825 0 21.325-8.625T344 749V604q0-12.75-8.675-21.375-8.676-8.625-21.5-8.625-12.825 0-21.325 8.625T284 604v145q0 12.75 8.675 21.375 8.676 8.625 21.5 8.625Zm332 0q12.825 0 21.325-8.625T676 749V389q0-12.75-8.675-21.375-8.676-8.625-21.5-8.625-12.825 0-21.325 8.625T616 389v360q0 12.75 8.675 21.375 8.676 8.625 21.5 8.625Zm-166 0q12.825 0 21.325-8.625T510 749v-58q0-12.75-8.675-21.375-8.676-8.625-21.5-8.625-12.825 0-21.325 8.625T450 691v58q0 12.75 8.675 21.375 8.676 8.625 21.5 8.625Zm.325-205q12.5 0 21-8.625T510 544v-1q0-12.325-9-20.662Q492 514 479.5 514t-21 8.625Q450 531.25 450 544v1q0 12.325 9 20.662Q468 574 480.5 574ZM180 876V276v600Z',
  code: 'M659 795q-9 9-21 8.5t-21-9.5q-9-9-9-21.5t9-21.5l177-177-176-176q-9-9-8.5-21.5T619 355q9-9 21.5-9t21.5 9l197 198q9 9 9 21t-9 21L659 795Zm-360-3L101 595q-9-9-9-21t9-21l200-200q9-9 21.5-9t21.5 9q9 9 9 21.5t-9 21.5L166 574l176 176q9 9 9 21t-9 21q-9 9-21.5 9t-21.5-9Z',
  ['keyborad-return']:
    'M338 794 142 598q-5-5-7-10.5t-2-10.5q0-6 2-11t7-10l196-196q9-9 22-9.5t22 8.5q9 9 9 21.5t-9 21.5L236 548h544V406q0-13 8.5-21.5T810 376q13 0 21.5 8.5T840 406v171q0 13-8.5 21.5T810 607H237l145 145q9 9 9 21t-9 21q-9 9-22 9t-22-9Z',
  speak:
    'M602 913q-16 5-29-5t-13-27q0-8 4.5-14.5T577 858q91-32 147-109t56-174q0-97-56-174.5T577 292q-8-2-12.5-9t-4.5-15q0-17 13.5-26.5T602 237q107 38 172.5 130.5T840 575q0 115-65.5 207.5T602 913ZM150 696q-13 0-21.5-8.5T120 666V486q0-13 8.5-21.5T150 456h130l149-149q14-14 32.5-6.5T480 328v496q0 20-18.5 27.5T429 845L280 696H150Zm390 48V407q54 17 87 64t33 105q0 59-33 105t-87 63ZM420 408 307 516H180v120h127l113 109V408Zm-94 168Z',
  compaign:
    'M760 606q-12.75 0-21.375-8.675-8.625-8.676-8.625-21.5 0-12.825 8.625-21.325T760 546h90q12.75 0 21.375 8.675 8.625 8.676 8.625 21.5 0 12.825-8.625 21.325T850 606h-90Zm-4 272-73-54q-10-8-12-19.826T677 782q8-10 19.826-12T719 776l73 54q10 8 12 19.826T798 872q-8 10-19.826 12T756 878Zm-34-503q-10.348 8-22.174 6Q688 379 680 369t-6-22q2-12 12-20l70-53q10.348-8 22.174-6Q790 270 798 280t6 22q-2 12-12 20l-70 53ZM210 856V696h-70q-24.75 0-42.375-17.625T80 636V516q0-24.75 17.625-42.375T140 456h180l155-93q15-9 30-.064T520 389v374q0 17.128-15 26.064T475 789l-155-93h-50v160h-60Zm90-280Zm260 134V442q27 24 43.5 58.5T620 576q0 41-16.5 75.5T560 710Zm-100 0V442l-124 74H140v120h196l124 74Z',
  copy: 'M300 855q-24.75 0-42.375-17.625T240 795V235q0-24.75 17.625-42.375T300 175h440q24.75 0 42.375 17.625T800 235v560q0 24.75-17.625 42.375T740 855H300Zm0-60h440V235H300v560ZM180 975q-24.75 0-42.375-17.625T120 915V342q0-12.75 8.675-21.375 8.676-8.625 21.5-8.625 12.825 0 21.325 8.625T180 342v573h444q12.75 0 21.375 8.675 8.625 8.676 8.625 21.5 0 12.825-8.625 21.325T624 975H180Zm120-740v560-560Z',
  ['copy-all']:
    'M324 832q-24 0-42-18t-18-42V236q0-24 18-42t42-18h416q24 0 42 18t18 42v536q0 24-18 42t-42 18H324Zm0-60h416V236H324v536ZM120 664h60v-84h-60v84Zm0-168h60v-84h-60v84Zm312 480h84v-60h-84v60ZM120 832h60v-84h-60v84Zm60 144v-60h-60q0 24 18 42t42 18Zm84 0h84v-60h-84v60Zm336 0q24 0 42-18t18-42h-60v60ZM120 328h60v-60q-24 0-42 18t-18 42Z',
  duplicate:
    'M140 976q-24 0-42-18t-18-42h60v60ZM80 828v-83h60v83H80Zm0-171v-83h60v83H80Zm0-170v-83h60v83H80Zm0-171q0-24 18-42t42-18v60H80Zm148 660v-60h83v60h-83Zm171 0v-60h83v60h-83Zm170 0v-60h83v60h-83Zm171 0v-60h60q0 24-18 42t-42 18ZM260 856q-24 0-42-18t-18-42V236q0-24 18-42t42-18h560q24 0 42 18t18 42v560q0 24-18 42t-42 18H260Zm0-60h560V416H550q-12.75 0-21.375-8.625T520 386V236H260v560Zm0-560v560-560Z',
  back: 'M627 948 276 597q-5-5-7-10t-2-11q0-6 2-11t7-10l351-351q11-11 28-11t28 11q12 12 12 28.5T683 261L368 576l315 315q13 13 12 29t-12 27q-12 12-28.5 12T627 948Z',
  visibility:
    'M480.118 726Q551 726 600.5 676.382q49.5-49.617 49.5-120.5Q650 485 600.382 435.5q-49.617-49.5-120.5-49.5Q409 386 359.5 435.618q-49.5 49.617-49.5 120.5Q310 627 359.618 676.5q49.617 49.5 120.5 49.5Zm-.353-58Q433 668 400.5 635.265q-32.5-32.736-32.5-79.5Q368 509 400.735 476.5q32.736-32.5 79.5-32.5Q527 444 559.5 476.735q32.5 32.736 32.5 79.5Q592 603 559.265 635.5q-32.736 32.5-79.5 32.5ZM480 856q-138 0-251.5-75T53.145 582.923Q50 578 48.5 570.826 47 563.652 47 556t1.5-14.826Q50 534 53.145 529.077 115 406 228.5 331T480 256q138 0 251.5 75t175.355 198.077Q910 534 911.5 541.174 913 548.348 913 556t-1.5 14.826q-1.5 7.174-4.645 12.097Q845 706 731.5 781T480 856Zm0-300Zm-.169 240Q601 796 702.5 730.5 804 665 857 556q-53-109-154.331-174.5-101.332-65.5-222.5-65.5Q359 316 257.5 381.5 156 447 102 556q54 109 155.331 174.5 101.332 65.5 222.5 65.5Z',
  ['visibility-off']:
    'm629 637-44-44q26-71-27-118t-115-24l-44-44q17-11 38-16t43-5q71 0 120.5 49.5T650 556q0 22-5.5 43.5T629 637Zm129 129-40-40q49-36 85.5-80.5T857 556q-50-111-150-175.5T490 316q-42 0-86 8t-69 19l-46-47q35-16 89.5-28T485 256q135 0 249 74t174 199q3 5 4 12t1 15q0 8-1 15.5t-4 12.5q-26 55-64 101t-86 81Zm36 204L648 827q-35 14-79 21.5t-89 7.5q-138 0-253-74T52 583q-3-6-4-12.5T47 556q0-8 1.5-15.5T52 528q21-45 53.5-87.5T182 360L77 255q-9-9-9-21t9-21q9-9 21.5-9t21.5 9l716 716q8 8 8 19.5t-8 20.5q-8 10-20.5 10t-21.5-9ZM223 402q-37 27-71.5 71T102 556q51 111 153.5 175.5T488 796q33 0 65-4t48-12l-64-64q-11 5-27 7.5t-30 2.5q-70 0-120-49t-50-121q0-15 2.5-30t7.5-27l-97-97Zm305 142Zm-116 58Z',
  ['check-on']:
    'M180 936q-24 0-42-18t-18-42V276q0-24 18-42t42-18h600q24 0 42 18t18 42v600q0 24-18 42t-42 18H180Zm0-60h600V276H180v600Zm239.133-153Q425 723 430 721q5-2 10-7l247-247q8-8 8.5-21t-8.5-22q-9-9-21.5-9t-21.5 9L419 649l-98-98q-8-8-20.5-8.5T279 551q-9 9-9 21.5t9 21.5l119 120q5 5 10.133 7 5.134 2 11 2ZM180 876V276v600Z',
  ['check-off']:
    'M180 936q-24 0-42-18t-18-42V276q0-24 18-42t42-18h600q24 0 42 18t18 42v600q0 24-18 42t-42 18H180Zm0-60h600V276H180v600Z',
  bubble:
    'M275 819q-65 0-110-45t-45-110q0-65 45-110t110-45q65 0 110 45t45 110q0 65-45 110t-110 45Zm0-60q40 0 67.5-27.5T370 664q0-40-27.5-67.5T275 569q-40 0-67.5 27.5T180 664q0 40 27.5 67.5T275 759Zm389.936-113Q575 646 512.5 583.436t-62.5-152.5Q450 341 512.564 278.5t152.5-62.5Q755 216 817.5 278.564t62.5 152.5Q880 521 817.436 583.5t-152.5 62.5Zm-80.054 290Q539 936 507 903.882q-32-32.117-32-78Q475 780 507.118 748q32.117-32 78-32Q631 716 663 748.118q32 32.117 32 78Q695 872 662.882 904q-32.117 32-78 32Zm79.892-350Q730 586 775 541.226t45-110Q820 366 775.226 321t-110-45Q600 276 555 320.774t-45 110Q510 496 554.774 541t110 45Zm-79.949 290Q606 876 620.5 861.675q14.5-14.324 14.5-35.5Q635 805 620.675 790.5q-14.324-14.5-35.5-14.5Q564 776 549.5 790.325q-14.5 14.324-14.5 35.5Q535 847 549.325 861.5q14.324 14.5 35.5 14.5ZM665 431ZM275 664Zm310 162Z',
}

export type SvgIconName = keyof typeof SVG_NAMES

export interface SvgIconProps {
  style?: StyleProp<ViewStyle>
  size: number
  color: ColorValue
  name: SvgIconName
}

export function SvgIcon(props: SvgIconProps) {
  const { style, size, color, name } = props
  const d = SVG_NAMES[name]
  return (
    <Svg style={style} viewBox="0 96 960 960" width={size} height={size}>
      <Path fill={color} d={d} />
    </Svg>
  )
}
