def test_user(new_user):
    assert new_user.email == "test@gmail.com"
    assert new_user.role == 2
    assert new_user.approved == False
    assert len(new_user.password) > 10


def test_model(new_method):
    assert new_method.comment == ""
    assert new_method.version == 0.1
    assert new_method.type == "type1"
    assert new_method.name == "method1"
    assert new_method.user == None
    assert new_method.head == True


def test_method_set(new_methodSet):
    assert new_methodSet.comment == ""
    assert new_methodSet.version == 0.1
    assert new_methodSet.head == True
    assert new_methodSet.vid != ""
    assert new_methodSet.name == "name"
    assert new_methodSet.user == None


def test_sample(new_sample):
    assert new_sample.sample_type != "samplename"
    assert new_sample.sample_name == "samplename"
    assert new_sample.comment == ""
    assert new_sample.version == 0.1
    assert new_sample.head == True
    assert new_sample.vid != ""


def test_sampleSet(new_sampleSet):
    assert new_sampleSet.system_name == "system_name"
    assert new_sampleSet.name == "name"
    assert new_sampleSet.user == None
    assert new_sampleSet.comment == ""
    assert new_sampleSet.version == 0.1
    assert new_sampleSet.head == True
    assert new_sampleSet.vid != ""
    assert new_sampleSet.descr == ""
    assert new_sampleSet.samples == []


def test_project(new_project):
    assert new_project.sop == "sop1"
    assert new_project.name == "name1"
    assert new_project.user == None
    assert new_project.descr == ""
