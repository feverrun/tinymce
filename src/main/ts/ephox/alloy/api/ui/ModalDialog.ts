import { Id, Merger } from '@ephox/katamari';
import { Traverse, Css, Width, Height } from '@ephox/sugar';
import * as AddEventsBehaviour from '../../api/behaviour/AddEventsBehaviour';

import * as AlloyEvents from '../../api/events/AlloyEvents';
import { CompositeSketchFactory } from '../../api/ui/UiSketcher';
import AriaLabel from '../../aria/AriaLabel';
import * as AlloyParts from '../../parts/AlloyParts';
import * as ModalDialogSchema from '../../ui/schema/ModalDialogSchema';
import { ModalDialogDetail, ModalDialogSketcher, ModalDialogSpec } from '../../ui/types/ModalDialogTypes';
import * as Behaviour from '../behaviour/Behaviour';
import { Keying } from '../behaviour/Keying';
import * as GuiFactory from '../component/GuiFactory';
import * as SketchBehaviours from '../component/SketchBehaviours';
import * as Attachment from '../system/Attachment';
import * as Sketcher from './Sketcher';
import { Replacing } from '../behaviour/Replacing';

const factory: CompositeSketchFactory<ModalDialogDetail, ModalDialogSpec> = (detail, components, spec, externals) => {
  // TODO IMPROVEMENT: Make close actually close the dialog by default!
  const showDialog = (dialog) => {
    const sink = detail.lazySink()().getOrDie();

    const busy = sink.getSystem().build(externals.busy());

    const blocker = sink.getSystem().build(
      Merger.deepMerge(
        externals.blocker(),
        {
          components: [
            GuiFactory.premade(dialog)
          ],
          behaviours: Behaviour.derive([
            AddEventsBehaviour.config('dialog-blocker-events', [
              AlloyEvents.run('unlock.dialog', (comp, se) => {
                Replacing.remove(comp, busy);
              }),

              AlloyEvents.run('lock.dialog', (comp, se) => {
                Css.setAll(busy.element(), {
                  left: Css.getRaw(dialog.element(), 'left').getOr('0'),
                  top: Css.getRaw(dialog.element(), 'top').getOr('0'),
                  width: Css.getRaw(dialog.element(), 'width').getOrThunk(() => Width.get(dialog.element()) + 'px'),
                  height: Css.getRaw(dialog.element(), 'height').getOrThunk(() => Height.get(dialog.element()) + 'px');
                });
                Replacing.append(comp, GuiFactory.premade(busy));
              }),
            ]),

            Replacing.config({ })
          ])
        }
      )
    );

    Attachment.attach(sink, blocker);
    Keying.focusIn(dialog);
  };

  const hideDialog = (dialog) => {
    Traverse.parent(dialog.element()).each((blockerDom) => {
      dialog.getSystem().getByDom(blockerDom).each((blocker) => {
        Attachment.detach(blocker);
      });
    });
  };

  const getDialogBody = (dialog) => {
    return AlloyParts.getPartOrDie(dialog, detail, 'body');
  };

  const modalEventsId = Id.generate('modal-events');
  const eventOrder = {
    ...detail.eventOrder(),
    'alloy.system.attached': [modalEventsId].concat(detail.eventOrder()['alloy.system.attached'] || [])
  };

  return {
    uid: detail.uid(),
    dom: Merger.deepMerge({
      attributes: {
        role: 'dialog'
      }
    }, detail.dom()),
    components,
    apis: {
      show: showDialog,
      hide: hideDialog,
      getBody: getDialogBody
    },
    eventOrder,
    behaviours: Merger.deepMerge(
      Behaviour.derive([
        Keying.config({
          mode: 'cyclic',
          onEnter: detail.onExecute(),
          onEscape: detail.onEscape(),
          useTabstopAt: detail.useTabstopAt()
        }),
        AddEventsBehaviour.config(modalEventsId, [
          AlloyEvents.runOnAttached((c) => {
            AriaLabel.labelledBy(c.element(), AlloyParts.getPartOrDie(c, detail, 'title').element());
          })
        ])
      ]),
      SketchBehaviours.get(detail.modalBehaviours())
    )
  };
};

const ModalDialog = Sketcher.composite({
  name: 'ModalDialog',
  configFields: ModalDialogSchema.schema(),
  partFields: ModalDialogSchema.parts(),
  factory,
  apis: {
    show (apis, dialog) {
      apis.show(dialog);
    },
    hide (apis, dialog) {
      apis.hide(dialog);
    },
    getBody (apis, dialog) {
      return apis.getBody(dialog);
    }
  }
}) as ModalDialogSketcher;

export {
  ModalDialog
};