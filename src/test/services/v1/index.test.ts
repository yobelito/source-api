import * as Chai from "chai";

import * as Services from "../../../main/services/v1";
import GetSourceId from "../../../main/services/v1/GetSourceId";
import PostLinkSourceToUser from "../../../main/services/v1/PostLinkSourceToUser";
import PostNewSource from "../../../main/services/v1/PostNewSource";

const expect = Chai.expect;

describe("serves/v1/index", function() {

    it("Tests that the export for the GetSourceId is correct.", function() {
        expect(Services.getSourceId).to.equal(GetSourceId);
    });

    it("Tests that the PostLinkSourceToUser is correct.", function() {
        expect(Services.postLinkSourceToUser).to.equal(PostLinkSourceToUser);
    });

    it("Tests that the PostNewSource is correct.", function() {
        expect(Services.postNewSource).to.equal(PostNewSource);
    })
});