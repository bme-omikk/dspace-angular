import { Bitstream } from '../../../../../app/core/shared/bitstream.model';

/**
 * Model representing a media viewer item
 */
export class OMIKKMediaViewerItem {
  /**
   * Incoming Bitsream
   */
  bitstream: Bitstream;

  /**
   * Incoming Bitsream format type
   */
  format: string;

  /**
   * Incoming Bitsream format mime type
   */
  mimetype: string;

  /**
   * Incoming Bitsream thumbnail
   */
  thumbnail: string;

  /**
   * Incoming Bitstream type
   */
  type: string;

  /**
   * Is downloadable?
   */
  canDownload: boolean;

}
