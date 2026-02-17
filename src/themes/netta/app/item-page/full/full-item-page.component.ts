import {
  AsyncPipe,
  KeyValuePipe,
  NgForOf,
  NgIf,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { ThemedItemAlertsComponent } from '../../../../../app/item-page/alerts/themed-item-alerts.component';
import { CollectionsComponent } from '../../../../../app/item-page/field-components/collections/collections.component';
import { ThemedFullFileSectionComponent } from '../../../../../app/item-page/full/field-components/file-section/themed-full-file-section.component';
import { FullItemPageComponent as BaseComponent } from '../../../../../app/item-page/full/full-item-page.component';
import { ThemedItemPageTitleFieldComponent } from '../../../../../app/item-page/simple/field-components/specific-field/title/themed-item-page-field.component';
import { ItemVersionsComponent } from '../../../../../app/item-page/versions/item-versions.component';
import { ItemVersionsNoticeComponent } from '../../../../../app/item-page/versions/notice/item-versions-notice.component';
import { fadeInOut } from '../../../../../app/shared/animations/fade';
import { DsoEditMenuComponent } from '../../../../../app/shared/dso-page/dso-edit-menu/dso-edit-menu.component';
import { ErrorComponent } from '../../../../../app/shared/error/error.component';
import { ThemedLoadingComponent } from '../../../../../app/shared/loading/themed-loading.component';
import { VarDirective } from '../../../../../app/shared/utils/var.directive';
import { ViewTrackerComponent } from '../../../../../app/statistics/angulartics/dspace/view-tracker.component';
import { NettaLinksComponent } from '../simple/field-components/specific-field/netta-links/netta-links.component';

/**
 * This component renders a full item page.
 * The route parameter 'id' is used to request the item it represents.
 */

@Component({
  selector: 'ds-themed-full-item-page',
  // styleUrls: ['./full-item-page.component.scss'],
  styleUrls: ['../../../../../app/item-page/full/full-item-page.component.scss'],
  templateUrl: './full-item-page.component.html',
  // templateUrl: '../../../../../app/item-page/full/full-item-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeInOut],
  standalone: true,
  imports: [
    ErrorComponent,
    ThemedLoadingComponent,
    TranslateModule,
    ThemedFullFileSectionComponent,
    CollectionsComponent,
    ItemVersionsComponent,
    NgIf,
    NgForOf,
    AsyncPipe,
    KeyValuePipe,
    RouterLink,
    ThemedItemPageTitleFieldComponent,
    DsoEditMenuComponent,
    ItemVersionsNoticeComponent,
    ViewTrackerComponent,
    ThemedItemAlertsComponent,
    VarDirective,
    NettaLinksComponent,
  ],
})
export class FullItemPageComponent extends BaseComponent {
  metadataMap: Map<string, string> = new Map([
    ['dc.contributor.advisor','item-contributor-advisor'],
    ['dc.contributor.author','item-author'],
    ['dc.contributor.editor','item-contributor-editor'],
    ['dc.contributor.illustrator','item-contributor-illustrator'],
    ['dc.coverage.spatial','item-coverage-spatial'],
    ['dc.date.accessioned','item-date-accessioned'],
    ['dc.date.available','item-date-available'],
    ['dc.date.created','item-date-created'],
    ['dc.date.defence','item-date-defence'],
    ['dc.date.issued','item-date-issued'],
    ['dc.date.submitted','item-date-submitted'],
    ['dc.description','item.page.description'],
    ['dc.description.abstract','item-description-abstract'],
    ['dc.description.provenance','item-description-provenance'],
    ['dc.description.sponsorship','item-description-sponsorship'],
    ['dc.format.extent','item-format-extent'],
    ['dc.format.medium','item-format-medium'],
    ['dc.identifier.citation','item-identifier-citation'],
    ['dc.identifier.doi','item-identifier-doi'],
    ['dc.identifier.isbn','item-identifier-isbn'],
    ['dc.identifier.issn','item-identifier-issn'],
    ['dc.identifier.uri','item-identifier-uri'],
    ['dc.language','item-language'],
    ['dc.language.iso','item-language'],
    ['dc.publisher','item-publisher'],
    ['dc.relation.replaces','item-relation-replaces'],
    ['dc.rights','item-rights'],
    ['dc.rights.holder','item-rights-holder'],
    ['dc.rights.license','item-rights-license'],
    ['dc.subject','item-subject'],
    ['dc.title','item-title'],
    ['dc.title.alternative','item-title-alternative'],
    ['dc.type','item-type'],
    ['dspace.thumbnail.page','item-filter-media-page'],
    ['dspace.viewpdf.enabled','item-viewpdf-enabled'],
    ['dcterms.accessRights','item-rights-access'],
    ['dcterms.rightsHolder','item-rights-holder'],
    ['local.address','item-description-address'],
    ['local.conferenceDate','item-other-conferenceDate'],
    ['local.conferencePlace','item-other-conferencePlace'],
    ['local.conferenceTitle','item-other-conferenceTitle'],
    ['local.containerDateIssued','item-other-containerDateIssued'],
    ['local.containerIdentifierIsbn','item-other-containerIdentifierIsbn'],
    ['local.containerIdentifierIssn','item-other-containerIdentifierIssn'],
    ['local.containerPeriodicalNumber','item-other-containerPeriodicalNumber'],
    ['local.containerPeriodicalVolume','item-other-containerPeriodicalVolume'],
    ['local.containerPeriodicalYear','item-other-containerPeriodicalYear'],
    ['local.containerPublisher','item-other-containerPublisher'],
    ['local.containerPublisherPlace','item-other-containerPublisherPlace'],
    ['local.containerTitle','item-other-containerTitle'],
    ['local.contributor.lector','item-contributor-lector'],
    ['local.contributor.translator','item-contributor-translator'],
    ['local.contributorBody','item-contributor-institution'],
    ['local.courseCode','item-description-courseCode'],
    ['local.courseName','item-description-courseName'],
    ['local.dateDefence','item-local-dateDefence'],
    ['local.dateNaturalization','item-date-naturalization'],
    ['local.department','item-publisher-department'],
    ['local.descriptionVersion','item-description-version'],
    ['local.doctoral-school','item-publisher-doctoralschool'],
    ['local.faculty','item-publisher-faculty'],
    ['local.firstpage','item-firstpage'],
    ['local.identifier','item-identifiers'],
    ['local.identifier.bmeomikk-aleph','local-identifier-bmeomikk-aleph'],
    ['local.identifier.bmeomikkCallnumber','local-identifier-bmeomikkCallnumber'],
    ['local.identifier.doi','local-identifier-doi'],
    ['local.identifier.doktori','local-identifier-doktori'],
    ['local.identifier.doktorihuHonositasID','local-identifier-honositas'],
    ['local.identifier.doktorihuHabilitacioID','local-identifier-habilitacio'],
    ['local.identifier.doktorihuVedesID','local-identifier-vedes'],
    ['local.identifier.handle','local-identifier-handle'],
    ['local.identifier.hoid','local-identifier-hoid'],
    ['local.identifier.mnl','local-identifier-mnl'],
    ['local.identifier.mtmt','local-identifier-mtmt'],
    ['local.identifier.neptun','local-identifier-neptun'],
    ['local.identifier.scopus','local-identifier-scopus'],
    ['local.identifier.wos','local-identifier-wos'],
    ['local.identifierLectureNotes','item-identifier-lectureNotes'],
    ['local.identifierReference','item-identifier-reference'],
    ['local.inscription','item-description-inscription'],
    ['local.lastpage','item-lastpage'],
    ['local.note','item-description-note'],
    ['local.noteOOC','item.page.localooc'],
    ['local.noteNotPublic','item-note-not-public'],
    ['local.other','item-other'],
    ['local.other.containerDoi','item-other-containerDoi'],
    ['local.page','item-format-page'],
    ['local.periodicalCreator','item-contributor-periodicalCreator'],
    ['local.periodicalNumber','item-other-periodicalNumber'],
    ['local.periodicalVolume','item-other-periodicalVolume'],
    ['local.periodicalYear','item-other-periodicalYear'],
    ['local.publisherPlace','item-other-containerPublisherPlace'],
    ['local.relatedHandle','item.page.relatedhandle'],
    ['local.relatedURL','item.page.relatedhandle'],
    ['local.scale','item-format-scale'],
    ['local.seriesNumber','item-other-seriesNumber'],
    ['local.seriesTitle','item-title-series'],
    ['local.signature','item-description-signature'],
    ['local.subjectArea','item-subject-area'],
    ['local.subjectAreaField','item-subject-area-field'],
    ['local.subjectField','item-subject-field'],
    ['local.subjectOszkar','item-subject-oszkar'],
    ['local.technique','item-format-technique'],
    ['local.temp-fieldArchiv','item-temp-field-archive'],
    ['local.temp-fieldCollections','item-temp-field-collections'],
    ['local.temp-fieldInMtmt','item-temp-field-inMtmt'],
    ['local.tender','item-tender'],
    ['local.titlenumber','item-description-titlenumber'],
    ['local.typeType','item-type-type'],
    ['local.university','item-publisher-university'],
    ['local.universityNaturalization','item-university-naturalization'],
    ['local.universityProgram','item-publisher-university-program'],
    ['local.universityProgramLevel','item-publisher-university-programlevel'],
  ]);

  showLink(key: string):boolean {
    return key.startsWith('local.identifier.') || key.includes('dc.identifier.doi');
  }
}
