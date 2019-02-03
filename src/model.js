import { LitElement, html } from '@polymer/lit-element';

export class Entity {
    constructor(id, name, location, stats=[], conns=[], props={}, history=[]) {
        this.id = id
        this.name = name;
        this.location = location;
        this.stats = stats;
        this.connections = conns;
        this.history = history;
        this.props = props;
    }

    createNode() {
        return {id: this.id,
                shape: 'dot',
                size: 'size' in this.props ? this.props.size + 16 : 16,
                color: 'color' in this.props ? this.props.color: 16,
                label: this.name}
    }

    createEdges() {
        return this.connections.map(oid => { return {from: this.id, to: oid} });
    }

    createStats() {
        return this.stats.map(d => { return d.createElement(); });
    }
};

// Data objects
export class Data {
    createElement() {
        return html``;
    }
};

export class Job extends Data {
    constructor(title, company) {
        super();
        this.title = title;
        this.company = company;
    }

    createElement() {
        return html`<div class="content"><div class="left subtext">Job</div>
                            <div class="right">${this.title} at ${this.company}</div></div>`;
    }
}
export class Education extends Data {
    constructor(university) {
        super();
        this.university = university;
    }

    createElement() {
        return html`<div class="content"><div class="left subtext">Education</div>
                            <div class="right">${this.university}</div></div>`;
    }
}
export class Experiences extends Data {
    constructor(experiences) {
        super();
        this.experiences = experiences;
    }

    createElement() {
        var e = [];
        for (let exp of this.experiences) {
            e.push(html`<div class="content"><div class="left subtext">${exp.duration}</div>
                            <div class="right">${exp.company}</div></div>`);
        }
        return html`<div class="content heading" style="padding-top: 20px; padding-bottom: 15px">Experience</div>${e}`;
    }
}

// Represents the state of the app
// with all top-level entities
export class State {
    constructor() {
        this.entities = [];
        this.selected = [];
        this.previews = [];

        // Signals for selecting and previewing history
        this.entitiesAddedHandlers = [];
        this.entitiesRemovedHandlers = [];
        this.selectedHandlers = [];
        this.previewingHandlers = [];
    }

    onSelect(handler) {
        this.selectedHandlers.push(handler);
    }

    onPreview(handler) {
        this.previewingHandlers.push(handler);
    }

    onEntitiesAdded(handler) {
        this.entitiesAddedHandlers.push(handler);
    }

    onEntitiesRemoved(handler) {
        this.entitiesRemovedHandlers.push(handler);
    }

    addEntities(entities) {
        this.entities.push(...entities);
        for (let h of this.entitiesAddedHandlers) {
            h(entities);
        }
    }
    removeEntities(entities) {
        this.entities = this.entities.filter((e) => !entities.includes(e));
        if (this.selected.length > 0) {
            this.selected = this.selected.filter((e) => !entities.includes(e));
        }
        for (let h of this.entitiesRemovedHandlers) {
            h(entities);
        }
    }

    select(selected) {
        this.selected = selected;
        for (let h of this.selectedHandlers) {
            h(selected);
        }
    }

    // Preview a node type being connected
    preview(type, connections) {
        for (let h of this.previewingHandlers) {
            h(type, connections);
        }
    }

    // Parsing function
    parseJSON(json) {
        var counter = 0;

        var companies = [];
        var divisions = [];
        for (let person of json) {
            if (person['College'].length == 0 || person['College'] == 'No results') {
                person['College'] = '';
            }
            if (person['Company'].length == 0 || person['Company'] == 'No results') {
                person['Company'] = '';
                continue;
            } else {
                companies.push(person['Company']);
            }
            if (!('Division' in person) ||
                person['Division'].length == 0 ||
                person['Division'] == 'No results') {
                person['Division'] = person['Job Title'];
            }
            divisions.push(person['Company'] + '/' + person['Division']);

            var exps = person['Experience'].split('\n');
            for (let e of exps) {
                var parts = e.split('\t');
                var title = parts[0];
                var comp = parts[1];
                companies.push(comp);
                //divisions.push(comp + '/' + title);
            }
        }
        var groups = {};
        var groupsByID = {};
        for (let company of companies) {
            if (!(company in groups)) {
                // Add the company
                var g = new Entity(counter++, company,
                               'None', [], [], {color: '#ff6666'});
                groups[company] = g;
                groupsByID[g.id] = g;
            }
        }
        for (let division of divisions) {
            var path = division;
            if (path.length > 0  && !(path in groups)) {
                var divisions = path.split("/");
                var div = divisions[divisions.length - 1];
                divisions.pop();

                var parentPath = divisions.join('/');
                var parentEntity = groups[parentPath];
                var g = new Entity(counter++, div, 'None', [],
                                parentEntity !== undefined ? [parentEntity.id] : [],
                                {color: '#33cc66'});
                groups[path] = g;
                groupsByID[g.id] = g;
            }
        }

        var people = [];
        for (let person of json) {
            var path = person['Company'] + '/' + person['Division'];
            var parentEntity = groups[path];

            var job = new Job(person['Job Title'], person['Company']);
            var education = new Education(person['College']);

            var history = [];

            var exps = person['Experience'].split('\n');
            var experienceData = [];
            for (let e of exps) {
                var parts = e.split('\t');
                var title = parts[0];
                var comp = parts[1];
                var dur = parts[2];
                if (dur == 'No Expiration Data') dur = '';
                experienceData.push({company: comp, duration: dur});
                if (groups[comp]) history.push(groups[comp].id);
            }
            var experience = new Experiences(experienceData);

            people.push( new Entity(counter++, person['Name'], person['Location'], 
                                    [job, education, experience],
                                    parentEntity !== undefined ? [parentEntity.id] : [],
                                    {}, history));
        }

        for (let person of json) {
            var path = person['Company'] + '/' + person['Division'];
            var parentEntity = groups[path];
            if (parentEntity) {
                parentEntity.props.size = ('size' in parentEntity.props) ? (parentEntity.props.size + 1) : 1;
            }
            path = person['Company'];
            parentEntity = groups[path];
            if (parentEntity) {
                parentEntity.props.size = ('size' in parentEntity.props) ? (parentEntity.props.size + 1) : 1;
            }
        }

        var entities = [];
        // Add to single array
        for (var k in groups) {
            entities.push(groups[k]);
        }
        for (let e of people) {
            entities.push(e);
        }
        this.removeEntities(this.entities);
        this.addEntities(entities);
    }
};
