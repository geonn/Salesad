//
//  SBSScanAreaSettings.h
//  ScanditBarcodeScanner
//
//  Created by Marco Biasini on 27/09/16.
//  Copyright © 2016 Scandit AG. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <CoreGraphics/CoreGraphics.h>

#import "SBSCommon.h"

/**
 * \brief Code location constraint.
 *
 * The code location constraint influences how the wide and square code location areas are
 * interpreted.
 *
 * \since 5.0
 */
SBS_ENUM_BEGIN(SBSCodeLocationConstraint) {
    /**
     * \brief Decoding is restricted to this area.
     *
     * Codes are no longer searched in \ref SBSScanAreaSettings#searchArea.
     *
     * \since 5.0
     */
    SBSCodeLocationConstraintRestrict = 0x01,
    /**
     * \brief The code location area is a hint.
     *
     * The code location area is a hint, higher priority is given to codes in this area, but codes 
     * continue to be searched in \ref SBSScanAreaSettings#searchArea.
     *
     * \since 5.0
     */
    SBSCodeLocationConstraintHint = 0x02,
} SBS_ENUM_END(SBSCodeLocationConstraint);

/**
 * \brief Scanning area settings control where codes are to be searched in images/frames.
 *
 * The areas as well as the hot-spot is specified in relative coordinates. The coordinates are rotated
 * with the device: The top-left corner of the camera preview is 0,0, whereas 1,1 is the bottom-right
 * corner. Coordinates specified outside of the supported range raise an exception.
 *
 * For most use-cases, the "active scanning area portrait/active scanning area landscape" available as
 * part of the \ref SBSScanSettings is sufficient and is simpler to use. We only recommend to use the
 * \ref SBSScanAreaSettings if you have very specific needs for your application that can't be met 
 * with the "active scanning area" interface.
 *
 * This class allows to control the areas separately for wide and square symbologies. Classification
 * of symbologies into square and wide is according to their aspect ratio: symbologies that have a
 * width/height ratio different from one (1d codes, PDF417, etc.) are classified as wide, symbologies 
 * whose width/height aspect ratio is close to 1.0 (QR, Aztec etc.) are classified as square. 
 * Symbologies whose aspect ratio can vary, e.g. DataMatrix, or DataBar, are classified according to 
 * their pre-dominant aspect ratio.
 *
 * \note This interface is not part of the stable API yet and is subject to change. Functionality 
 *      may dissappear, or change in future releases.
 * \since 5.0
 */
@interface SBSScanAreaSettings : NSObject


/**
 * \brief Returns a new instance with default settings for portrait scanning.
 *
 * \since 5.0
 */
+(instancetype)defaultPortraitSettings;


/**
 * \brief Returns a new instance with default settings for landscape scanning.
 *
 * \since 5.0
 */
+(instancetype)defaultLandscapeSettings;

/**
 * \brief The area in which codes are searched.
 *
 * By default, codes are searched in the whole image.
 *
 * \since 5.0
 */
@property (assign, nonatomic) CGRect searchArea;

/**
 * \brief Code location area for wide codes.
 *
 * \since 5.0
 */
@property (assign, nonatomic) CGRect wideCodesLocationArea;

/**
 * \brief Code location constraint for wide codes
 *
 * \since 5.0
 */
@property (assign, nonatomic) SBSCodeLocationConstraint wideCodesLocationConstraint;

/**
 * \brief Code location area for square codes
 *
 * \since 5.0
 */
@property (assign, nonatomic) CGRect squareCodesLocationArea;

/**
 * \brief Code location constraint for square codes
 *
 * \since 5.0
 */
@property (assign, nonatomic) SBSCodeLocationConstraint squareCodesLocationConstraint;


@end
