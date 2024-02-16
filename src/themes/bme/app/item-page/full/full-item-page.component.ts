import { map } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { fadeInOut } from '../../../../../app/shared/animations/fade';
import { FullItemPageComponent as BaseComponent } from '../../../../../app/item-page/full/full-item-page.component';

import { ActivatedRoute, Data, Router } from '@angular/router';
import { ItemDataService } from '../../../../../app/core/data/item-data.service';
import { AuthService } from '../../../../../app/core/auth/auth.service';
import { AuthorizationDataService } from '../../../../../app/core/data/feature-authorization/authorization-data.service';
import { Location } from '@angular/common';
import { ServerResponseService } from '../../../../../app/core/services/server-response.service';
import { SignpostingDataService } from '../../../../../app/core/data/signposting-data.service';
import { LinkHeadService } from '../../../../../app/core/services/link-head.service';

/**
 * This component renders a full item page.
 * The route parameter 'id' is used to request the item it represents.
 */

@Component({
  selector: 'ds-full-item-page',
  styleUrls: ['./full-item-page.component.scss'],
  templateUrl: './full-item-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [fadeInOut]
})
export class FullItemPageComponent extends BaseComponent implements OnInit {
  relatedTypesMap: Map<string, string> = new Map(
    [
        ['DOI','https://doi.org/']
      , ['OMIKKHANDLE', 'http://hdl.handle.net/']
    ]
  );
  metadataMap: Map<string, string> = new Map([['dc.date.accessioned', 'blabla']]);

  isValidHandleID(parts) {
    if (parts.length!=2) {
      return false;
    }
    else {
      if (this.relatedTypesMap.has(parts[0].toUpperCase())) {
        return true;
      }
      else {
        return false;
      }
    }
  }

  processID(value: string, what: string) {
    let parts = value.split("@");

    if (this.isValidHandleID(parts)) {
      if (what=='href') {
        return this.relatedTypesMap.get(parts[0].toUpperCase()) + parts[1];
      }
      else {
        return parts[1];
      }
    }
    else {
      return value;
    }
  }

  getGeneratedURI(value: string) {
    return this.processID(value, 'href');
  }

  getIDPart(value: string) {
    return this.processID(value, 'title');
  }

  constructor(
    protected route: ActivatedRoute,
    protected router: Router,
    protected items: ItemDataService,
    protected authService: AuthService,
    protected authorizationService: AuthorizationDataService,
    protected _location: Location,
    protected responseService: ServerResponseService,
    protected signpostingDataService: SignpostingDataService,
    protected linkHeadService: LinkHeadService,
    @Inject(PLATFORM_ID) protected platformId: string,
    )
  {
    super(route, router, items, authService, authorizationService, _location, responseService, signpostingDataService, linkHeadService, platformId);
    this.metadataMap.set('dc.contributor.advisor',"item-contributor-advisor");
    this.metadataMap.set('dc.contributor.author',"item-author");
    this.metadataMap.set('dc.contributor.editor',"item-contributor-editor");
    this.metadataMap.set('dc.contributor.illustrator',"item-contributor-illustrator");
    this.metadataMap.set('dc.coverage.spatial',"item-coverage-spatial");
    this.metadataMap.set('dc.date.accessioned',"item-date-accessioned");
    this.metadataMap.set('dc.date.available',"item-date-available");
    this.metadataMap.set('dc.date.created',"item-date-created");
    this.metadataMap.set('dc.date.defence',"item-date-defence");
    this.metadataMap.set('dc.date.issued',"item-date-issued");
    this.metadataMap.set('dc.description.abstract',"item-description-abstract");
    this.metadataMap.set('dc.description.provenance',"item-description-provenance");
    this.metadataMap.set('dc.description.sponsorship',"item-description-sponsorship");
    this.metadataMap.set('dc.format.extent',"item-format-extent");
    this.metadataMap.set('dc.format.medium',"item-format-medium");
    this.metadataMap.set('dc.identifier.isbn',"item-identifier-isbn");
    this.metadataMap.set('dc.identifier.issn',"item-identifier-issn");
    this.metadataMap.set('dc.identifier.uri',"item-identifier-uri");
    this.metadataMap.set('dc.language',"item-language");
    this.metadataMap.set('dc.publisher',"item-publisher");
    this.metadataMap.set('dc.relation.replaces',"item-relation-replaces");
    this.metadataMap.set('dc.rights',"item-rights");
    this.metadataMap.set('dc.rights.license',"item-rights-license");
    this.metadataMap.set('dc.subject',"item-subject");
    this.metadataMap.set('dc.title',"item-title");
    this.metadataMap.set('dc.title.alternative',"item-title-alternative");
    this.metadataMap.set('dc.type',"item-type");
    this.metadataMap.set('dcterms.accessRights',"item-rights-access");
    this.metadataMap.set('dcterms.rightsHolder',"item-rights-holder");
    this.metadataMap.set('local.address',"item-description-address");
    this.metadataMap.set('local.conferenceDate',"item-other-conferenceDate");
    this.metadataMap.set('local.conferencePlace',"item-other-conferencePlace");
    this.metadataMap.set('local.conferenceTitle',"item-other-conferenceTitle");
    this.metadataMap.set('local.containerDateIssued',"item-other-containerDateIssued");
    this.metadataMap.set('local.containerIdentifierIsbn',"item-other-containerIdentifierIsbn");
    this.metadataMap.set('local.containerIdentifierIssn',"item-other-containerIdentifierIssn");
    this.metadataMap.set('local.containerPeriodicalNumber',"item-other-containerPeriodicalNumber");
    this.metadataMap.set('local.containerPeriodicalVolume',"item-other-containerPeriodicalVolume");
    this.metadataMap.set('local.containerPeriodicalYear',"item-other-containerPeriodicalYear");
    this.metadataMap.set('local.containerPublisher',"item-other-containerPublisher");
    this.metadataMap.set('local.containerPublisherPlace',"item-other-containerPublisherPlace");
    this.metadataMap.set('local.containerTitle',"item-other-containerTitle");
    this.metadataMap.set('local.contributor.lector',"item-contributor-lector");
    this.metadataMap.set('local.contributor.translator',"item-contributor-translator");
    this.metadataMap.set('local.contributorBody',"item-contributor-institution");
    this.metadataMap.set('local.courseCode',"item-description-courseCode");
    this.metadataMap.set('local.courseName',"item-description-courseName");
    this.metadataMap.set('local.dateDefence',"item-local-dateDefence");
    this.metadataMap.set('local.dateNaturalization',"item-date-naturalization");
    this.metadataMap.set('local.department',"item-publisher-department");
    this.metadataMap.set('local.descriptionVersion',"item-description-version");
    this.metadataMap.set('local.doctoral-school',"item-publisher-doctoralschool");
    this.metadataMap.set('local.faculty',"item-publisher-faculty");
    this.metadataMap.set('local.firstpage',"item-firstpage");
    this.metadataMap.set('local.identifier',"item-identifiers");
    this.metadataMap.set('local.identifier.bmeomikk-aleph',"local-identifier-bmeomikk-aleph");
    this.metadataMap.set('local.identifier.bmeomikkCallnumber',"local-identifier-bmeomikkCallnumber");
    this.metadataMap.set('local.identifier.doi',"local-identifier-doi");
    this.metadataMap.set('local.identifier.doktori',"local-identifier-doktori");
    this.metadataMap.set('local.identifier.doktorihuHonositasID',"local-identifier-honositas");
    this.metadataMap.set('local.identifier.doktorihuHabilitacioID',"local-identifier-habilitacio");
    this.metadataMap.set('local.identifier.doktorihuVedesID',"local-identifier-vedes");
    this.metadataMap.set('local.identifier.handle',"local-identifier-handle");
    this.metadataMap.set('local.identifier.hoid',"local-identifier-hoid");
    this.metadataMap.set('local.identifier.mnl',"local-identifier-mnl");
    this.metadataMap.set('local.identifier.mtmt',"local-identifier-mtmt");
    this.metadataMap.set('local.identifier.neptun',"local-identifier-neptun");
    this.metadataMap.set('local.identifier.scopus',"local-identifier-scopus");
    this.metadataMap.set('local.identifier.wos',"local-identifier-wos");
    this.metadataMap.set('local.identifierLectureNotes',"item-identifier-lectureNotes");
    this.metadataMap.set('local.identifierReference',"item-identifier-reference");
    this.metadataMap.set('local.inscription',"item-description-inscription");
    this.metadataMap.set('local.lastpage',"item-lastpage");
    this.metadataMap.set('local.note',"item-description-note");
    this.metadataMap.set('local.noteNotPublic',"item-note-not-public");
    this.metadataMap.set('local.other',"item-other");
    this.metadataMap.set('local.page',"item-format-page");
    this.metadataMap.set('local.periodicalCreator',"item-contributor-periodicalCreator");
    this.metadataMap.set('local.periodicalNumber',"item-other-periodicalNumber");
    this.metadataMap.set('local.periodicalVolume',"item-other-periodicalVolume");
    this.metadataMap.set('local.periodicalYear',"item-other-periodicalYear");
    this.metadataMap.set('local.publisherPlace',"item-other-containerPublisherPlace");
    this.metadataMap.set('local.relatedHandle',"item.page.relatedhandle");
    this.metadataMap.set('local.relatedURL',"item.page.relatedhandle");
    this.metadataMap.set('local.scale',"item-format-scale");
    this.metadataMap.set('local.seriesNumber',"item-other-seriesNumber");
    this.metadataMap.set('local.seriesTitle',"item-title-series");
    this.metadataMap.set('local.signature',"item-description-signature");
    this.metadataMap.set('local.subjectArea',"item-subject-area");
    this.metadataMap.set('local.subjectAreaField',"item-subject-area-field");
    this.metadataMap.set('local.subjectField',"item-subject-field");
    this.metadataMap.set('local.subjectOszkar',"item-subject-oszkar");
    this.metadataMap.set('local.technique',"item-format-technique");
    this.metadataMap.set('local.temp-fieldArchiv',"item-temp-field-archive");
    this.metadataMap.set('local.temp-fieldCollections',"item-temp-field-collections");
    this.metadataMap.set('local.temp-fieldInMtmt',"item-temp-field-inMtmt");
    this.metadataMap.set('local.tender',"item-tender");
    this.metadataMap.set('local.titlenumber',"item-description-titlenumber");
    this.metadataMap.set('local.typeType',"item-type-type");
    this.metadataMap.set('local.university',"item-publisher-university");
    this.metadataMap.set('local.universityNaturalization',"item-university-naturalization");
    this.metadataMap.set('local.universityProgram',"item-publisher-university-program");
    this.metadataMap.set('local.universityProgramLevel',"item-publisher-university-programlevel");
  }
}
